local Tunnel = module("vrp", "lib/Tunnel")
local Proxy = module("vrp", "lib/Proxy")

vRP = Proxy.getInterface("vRP")
vRPclient = Tunnel.getInterface("vRP")

-- ============================================
-- HELPERS VRPEX
-- ============================================

function GetVisaIdFromSource(source)
    local user_id = vRP.getUserId(source)
    return user_id
end

function GetPlayerIdentity(visaId)
    local identity = vRP.getIdentity(visaId)
    return identity
end

function HasPolicePermission(source, permission)
    local user_id = vRP.getUserId(source)
    local groups = vRP.getUserGroups(user_id)
    
    for group, _ in pairs(groups) do
        for _, rank in ipairs(Config.Ranks) do
            if group == rank.name then
                if rank.permissions[1] == 'all' then
                    return true
                end
                for _, perm in ipairs(rank.permissions) do
                    if perm == permission then
                        return true
                    end
                end
            end
        end
    end
    return false
end

-- ============================================
-- ESTATÍSTICAS
-- ============================================

vRP.registerRequest('tablet:getStats', function(source, data)
    local bulletins = MySQL.Sync.fetchScalar('SELECT COUNT(*) FROM police_occurrences')
    local officers = MySQL.Sync.fetchScalar('SELECT COUNT(*) FROM police_employees')
    local onDuty = MySQL.Sync.fetchScalar('SELECT COUNT(*) FROM police_employees WHERE is_on_duty = 1')
    local activeRecruitments = MySQL.Sync.fetchScalar("SELECT COUNT(*) FROM police_recruitment WHERE status = 'Pendente'")
    local pendingOccurrences = MySQL.Sync.fetchScalar("SELECT COUNT(*) FROM police_occurrences WHERE status = 'Aberto'")
    
    return {
        bulletins = bulletins or 0,
        officers = officers or 0,
        onDuty = onDuty or 0,
        activeRecruitments = activeRecruitments or 0,
        pendingOccurrences = pendingOccurrences or 0
    }
end)

-- ============================================
-- PONTO/SERVIÇO (VRPex)
-- ============================================

vRP.registerRequest('duty:clockIn', function(source, data)
    local visaId = GetVisaIdFromSource(source)
    local time = os.date('%d/%m/%Y %H:%M')
    
    local rowsChanged = MySQL.Sync.execute('UPDATE police_employees SET is_on_duty = 1, last_clock_in = @time WHERE visa_id = @visaId', {
        ['@visaId'] = visaId,
        ['@time'] = time
    })
    
    if rowsChanged > 0 then
        MySQL.Async.execute('INSERT INTO police_clock_history (visa_id, type, date) VALUES (@visaId, @type, @date)', {
            ['@visaId'] = visaId,
            ['@type'] = 'in',
            ['@date'] = time
        })
    end
    
    return { success = rowsChanged > 0, time = time }
end)

vRP.registerRequest('duty:clockOut', function(source, data)
    local visaId = GetVisaIdFromSource(source)
    local time = os.date('%d/%m/%Y %H:%M')
    
    local rowsChanged = MySQL.Sync.execute('UPDATE police_employees SET is_on_duty = 0 WHERE visa_id = @visaId', {
        ['@visaId'] = visaId
    })
    
    if rowsChanged > 0 then
        MySQL.Async.execute('INSERT INTO police_clock_history (visa_id, type, date) VALUES (@visaId, @type, @date)', {
            ['@visaId'] = visaId,
            ['@type'] = 'out',
            ['@date'] = time
        })
    end
    
    return { success = rowsChanged > 0, time = time }
end)

vRP.registerRequest('duty:getStatus', function(source, data)
    local visaId = GetVisaIdFromSource(source)
    
    local result = MySQL.Sync.fetchAll('SELECT is_on_duty, last_clock_in FROM police_employees WHERE visa_id = @visaId', {
        ['@visaId'] = visaId
    })
    
    if result[1] then
        return {
            isOnDuty = result[1].is_on_duty == 1,
            clockInTime = result[1].last_clock_in
        }
    end
    
    return { isOnDuty = false }
end)

vRP.registerRequest('duty:getOnDutyOfficers', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT e.*, r.name as rank_name, r.color as rank_color 
        FROM police_employees e 
        LEFT JOIN police_ranks r ON e.rank_id = r.id 
        WHERE e.is_on_duty = 1
    ]], {})
    
    local officers = {}
    for _, row in ipairs(result) do
        table.insert(officers, {
            id = row.id,
            visaId = tostring(row.visa_id),
            name = row.name,
            rank = row.rank_name,
            rankColor = row.rank_color,
            clockInTime = row.last_clock_in
        })
    end
    
    return officers
end)

vRP.registerRequest('duty:force', function(source, data)
    if not HasPolicePermission(source, 'employees') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute('UPDATE police_employees SET is_on_duty = @status WHERE visa_id = @visaId', {
        ['@visaId'] = data.visaId,
        ['@status'] = data.status and 1 or 0
    })
    
    return { success = rowsChanged > 0 }
end)

-- ============================================
-- CARGOS/PATENTES (VRPex)
-- ============================================

vRP.registerRequest('positions:getAll', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT r.*, 
            (SELECT COUNT(*) FROM police_employees WHERE rank_id = r.id) as officer_count
        FROM police_ranks r 
        ORDER BY r.id ASC
    ]], {})
    
    local positions = {}
    for _, row in ipairs(result) do
        table.insert(positions, {
            id = row.id,
            name = row.name,
            salary = 'R$ ' .. tostring(row.salary),
            officerCount = row.officer_count,
            color = row.color,
            permissions = json.decode(row.permissions) or {}
        })
    end
    
    return positions
end)

vRP.registerRequest('positions:updatePermissions', function(source, data)
    if not HasPolicePermission(source, 'positions') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute('UPDATE police_ranks SET permissions = @permissions WHERE id = @id', {
        ['@id'] = data.positionId,
        ['@permissions'] = json.encode(data.permissions)
    })
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('positions:updateSalary', function(source, data)
    if not HasPolicePermission(source, 'positions') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute('UPDATE police_ranks SET salary = @salary WHERE id = @id', {
        ['@id'] = data.positionId,
        ['@salary'] = data.salary
    })
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('positions:create', function(source, data)
    if not HasPolicePermission(source, 'positions') then
        return { success = false }
    end
    
    MySQL.Sync.execute([[
        INSERT INTO police_ranks (name, salary, color, permissions) 
        VALUES (@name, @salary, @color, @permissions)
    ]], {
        ['@name'] = data.name,
        ['@salary'] = tonumber(string.gsub(data.salary, '[^0-9]', '')) or 0,
        ['@color'] = data.color,
        ['@permissions'] = json.encode(data.permissions)
    })
    
    local insertId = MySQL.Sync.fetchScalar('SELECT LAST_INSERT_ID()')
    return { success = true, id = insertId }
end)

vRP.registerRequest('positions:delete', function(source, data)
    if not HasPolicePermission(source, 'positions') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute('DELETE FROM police_ranks WHERE id = @id', {
        ['@id'] = data.positionId
    })
    
    return { success = rowsChanged > 0 }
end)

-- ============================================
-- FUNCIONÁRIOS (VRPex)
-- ============================================

vRP.registerRequest('employees:getAll', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT e.*, r.name as rank_name, r.color as rank_color 
        FROM police_employees e 
        LEFT JOIN police_ranks r ON e.rank_id = r.id 
        ORDER BY e.rank_id ASC
    ]], {})
    
    local employees = {}
    for _, row in ipairs(result) do
        table.insert(employees, {
            id = row.id,
            visaId = tostring(row.visa_id),
            name = row.name,
            rank = row.rank_name,
            rankId = row.rank_id,
            rankColor = row.rank_color,
            lastClockIn = row.last_clock_in or 'Nunca',
            isOnDuty = row.is_on_duty == 1,
            bulletinsCreated = row.bulletins_created or 0,
            isRecruiter = row.is_recruiter == 1
        })
    end
    
    return employees
end)

vRP.registerRequest('employees:getDetails', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT e.*, r.name as rank_name, r.color as rank_color 
        FROM police_employees e 
        LEFT JOIN police_ranks r ON e.rank_id = r.id 
        WHERE e.visa_id = @visaId
    ]], {
        ['@visaId'] = data.visaId
    })
    
    if result[1] then
        local row = result[1]
        local clockHistory = MySQL.Sync.fetchAll([[
            SELECT type, date FROM police_clock_history 
            WHERE visa_id = @visaId 
            ORDER BY date DESC LIMIT 50
        ]], {
            ['@visaId'] = data.visaId
        })
        
        return {
            id = row.id,
            visaId = tostring(row.visa_id),
            name = row.name,
            rank = row.rank_name,
            rankId = row.rank_id,
            rankColor = row.rank_color,
            lastClockIn = row.last_clock_in or 'Nunca',
            isOnDuty = row.is_on_duty == 1,
            bulletinsCreated = row.bulletins_created or 0,
            isRecruiter = row.is_recruiter == 1,
            clockHistory = clockHistory
        }
    end
    
    return nil
end)

vRP.registerRequest('employees:updateRank', function(source, data)
    if not HasPolicePermission(source, 'employees') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute('UPDATE police_employees SET rank_id = @rankId WHERE visa_id = @visaId', {
        ['@visaId'] = data.visaId,
        ['@rankId'] = data.newRankId
    })
    
    -- Atualiza grupo no vRP
    if rowsChanged > 0 then
        local rank = MySQL.Sync.fetchAll('SELECT name FROM police_ranks WHERE id = @id', {
            ['@id'] = data.newRankId
        })
        
        if rank[1] then
            -- Remove grupos antigos de polícia
            for _, r in ipairs(Config.Ranks) do
                vRP.removeUserGroup(tonumber(data.visaId), r.name)
            end
            -- Adiciona novo grupo
            vRP.addUserGroup(tonumber(data.visaId), rank[1].name)
        end
    end
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('employees:toggleRecruiter', function(source, data)
    if not HasPolicePermission(source, 'employees') then
        return { success = false }
    end
    
    local currentValue = MySQL.Sync.fetchScalar('SELECT is_recruiter FROM police_employees WHERE visa_id = @visaId', {
        ['@visaId'] = data.visaId
    })
    
    local newValue = currentValue == 1 and 0 or 1
    
    local rowsChanged = MySQL.Sync.execute('UPDATE police_employees SET is_recruiter = @value WHERE visa_id = @visaId', {
        ['@visaId'] = data.visaId,
        ['@value'] = newValue
    })
    
    return { success = rowsChanged > 0, isRecruiter = newValue == 1 }
end)

vRP.registerRequest('employees:dismiss', function(source, data)
    if not HasPolicePermission(source, 'employees') then
        return { success = false }
    end
    
    -- Remove do vRP
    for _, r in ipairs(Config.Ranks) do
        vRP.removeUserGroup(tonumber(data.visaId), r.name)
    end
    
    local rowsChanged = MySQL.Sync.execute('DELETE FROM police_employees WHERE visa_id = @visaId', {
        ['@visaId'] = data.visaId
    })
    
    -- Log
    if rowsChanged > 0 then
        local adminVisaId = GetVisaIdFromSource(source)
        MySQL.Async.execute([[
            INSERT INTO police_logs (action, admin_visa_id, target_visa_id, reason, date) 
            VALUES (@action, @admin, @target, @reason, @date)
        ]], {
            ['@action'] = 'DISMISS',
            ['@admin'] = adminVisaId,
            ['@target'] = data.visaId,
            ['@reason'] = data.reason or 'Não especificado',
            ['@date'] = os.date('%Y-%m-%d %H:%M:%S')
        })
    end
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('employees:getClockHistory', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT type, date FROM police_clock_history 
        WHERE visa_id = @visaId 
        ORDER BY date DESC LIMIT 50
    ]], {
        ['@visaId'] = data.visaId
    })
    
    return result
end)

vRP.registerRequest('employees:addWarning', function(source, data)
    if not HasPolicePermission(source, 'employees') then
        return { success = false }
    end
    
    local adminVisaId = GetVisaIdFromSource(source)
    local adminIdentity = GetPlayerIdentity(adminVisaId)
    
    MySQL.Sync.execute([[
        INSERT INTO police_warnings (visa_id, reason, date, issued_by) 
        VALUES (@visaId, @reason, @date, @issuedBy)
    ]], {
        ['@visaId'] = data.visaId,
        ['@reason'] = data.reason,
        ['@date'] = os.date('%Y-%m-%d %H:%M:%S'),
        ['@issuedBy'] = adminIdentity and (adminIdentity.name .. ' ' .. adminIdentity.firstname) or 'Sistema'
    })
    
    return { success = true }
end)

vRP.registerRequest('employees:getWarnings', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT id, reason, date, issued_by as issuedBy 
        FROM police_warnings 
        WHERE visa_id = @visaId 
        ORDER BY date DESC
    ]], {
        ['@visaId'] = data.visaId
    })
    
    return result
end)

-- ============================================
-- OCORRÊNCIAS (VRPex)
-- ============================================

vRP.registerRequest('occurrences:getAll', function(source, data)
    local result = MySQL.Sync.fetchAll('SELECT * FROM police_occurrences ORDER BY created_at DESC', {})
    
    local occurrences = {}
    for _, row in ipairs(result) do
        table.insert(occurrences, {
            id = row.id,
            title = row.title,
            date = row.date,
            requester = row.requester,
            openedBy = row.opened_by,
            openedAt = row.opened_at,
            description = row.description,
            status = row.status
        })
    end
    
    return occurrences
end)

vRP.registerRequest('occurrences:getDetails', function(source, data)
    local result = MySQL.Sync.fetchAll('SELECT * FROM police_occurrences WHERE id = @id', {
        ['@id'] = data.occurrenceId
    })
    
    if result[1] then
        local row = result[1]
        local officers = MySQL.Sync.fetchAll([[
            SELECT e.visa_id, e.name FROM police_occurrence_officers oo
            JOIN police_employees e ON oo.visa_id = e.visa_id
            WHERE oo.occurrence_id = @id
        ]], {
            ['@id'] = data.occurrenceId
        })
        
        return {
            id = row.id,
            title = row.title,
            date = row.date,
            requester = row.requester,
            openedBy = row.opened_by,
            openedAt = row.opened_at,
            description = row.description,
            status = row.status,
            involvedOfficers = officers
        }
    end
    
    return nil
end)

vRP.registerRequest('occurrences:create', function(source, data)
    if not HasPolicePermission(source, 'occurrences') then
        return { success = false }
    end
    
    local visaId = GetVisaIdFromSource(source)
    local identity = GetPlayerIdentity(visaId)
    local playerName = identity and (identity.name .. ' ' .. identity.firstname) or 'Desconhecido'
    local date = os.date('%Y-%m-%d')
    local openedAt = os.date('%d/%m/%Y %H:%M')
    
    MySQL.Sync.execute([[
        INSERT INTO police_occurrences (title, date, requester, opened_by, opened_at, description, status, created_at) 
        VALUES (@title, @date, @requester, @openedBy, @openedAt, @description, @status, NOW())
    ]], {
        ['@title'] = data.title,
        ['@date'] = date,
        ['@requester'] = data.requester,
        ['@openedBy'] = playerName,
        ['@openedAt'] = openedAt,
        ['@description'] = data.description or '',
        ['@status'] = 'Aberto'
    })
    
    local insertId = MySQL.Sync.fetchScalar('SELECT LAST_INSERT_ID()')
    
    -- Incrementa contador de boletins do oficial
    MySQL.Async.execute('UPDATE police_employees SET bulletins_created = bulletins_created + 1 WHERE visa_id = @visaId', {
        ['@visaId'] = visaId
    })
    
    return { success = true, id = insertId }
end)

vRP.registerRequest('occurrences:update', function(source, data)
    if not HasPolicePermission(source, 'occurrences') then
        return { success = false }
    end
    
    local setClause = {}
    local params = { ['@id'] = data.occurrenceId }
    
    for key, value in pairs(data.data) do
        table.insert(setClause, key .. ' = @' .. key)
        params['@' .. key] = value
    end
    
    if #setClause > 0 then
        local rowsChanged = MySQL.Sync.execute('UPDATE police_occurrences SET ' .. table.concat(setClause, ', ') .. ' WHERE id = @id', params)
        return { success = rowsChanged > 0 }
    end
    
    return { success = false }
end)

vRP.registerRequest('occurrences:delete', function(source, data)
    if not HasPolicePermission(source, 'occurrences') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute('DELETE FROM police_occurrences WHERE id = @id', {
        ['@id'] = data.occurrenceId
    })
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('occurrences:addOfficer', function(source, data)
    if not HasPolicePermission(source, 'occurrences') then
        return { success = false }
    end
    
    MySQL.Sync.execute([[
        INSERT IGNORE INTO police_occurrence_officers (occurrence_id, visa_id) 
        VALUES (@occurrenceId, @visaId)
    ]], {
        ['@occurrenceId'] = data.occurrenceId,
        ['@visaId'] = data.visaId
    })
    
    return { success = true }
end)

vRP.registerRequest('occurrences:close', function(source, data)
    if not HasPolicePermission(source, 'occurrences') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute([[
        UPDATE police_occurrences 
        SET status = 'Fechado', resolution = @resolution, closed_at = NOW() 
        WHERE id = @id
    ]], {
        ['@id'] = data.occurrenceId,
        ['@resolution'] = data.resolution
    })
    
    return { success = rowsChanged > 0 }
end)

-- ============================================
-- CIDADÃOS (VRPex)
-- ============================================

vRP.registerRequest('citizens:getAll', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT id, visaid as visa_id, name, firstname, phone 
        FROM vrp_user_identities 
        LIMIT 100
    ]], {})
    
    local citizens = {}
    for _, row in ipairs(result) do
        table.insert(citizens, {
            id = row.id,
            visaId = tostring(row.visa_id),
            name = (row.name or '') .. ' ' .. (row.firstname or ''),
            phone = row.phone or 'N/A',
            registration = tostring(row.visa_id)
        })
    end
    
    return citizens
end)

vRP.registerRequest('citizens:search', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT id, visaid as visa_id, name, firstname, phone 
        FROM vrp_user_identities 
        WHERE name LIKE @query 
        OR firstname LIKE @query 
        OR visaid LIKE @query 
        LIMIT 50
    ]], {
        ['@query'] = '%' .. data.query .. '%'
    })
    
    local citizens = {}
    for _, row in ipairs(result) do
        table.insert(citizens, {
            id = row.id,
            visaId = tostring(row.visa_id),
            name = (row.name or '') .. ' ' .. (row.firstname or ''),
            phone = row.phone or 'N/A',
            registration = tostring(row.visa_id)
        })
    end
    
    return citizens
end)

vRP.registerRequest('citizens:getDetails', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT * FROM vrp_user_identities WHERE visaid = @visaId
    ]], {
        ['@visaId'] = data.visaId
    })
    
    if result[1] then
        local row = result[1]
        local criminalRecord = MySQL.Sync.fetchAll([[
            SELECT * FROM police_criminal_records WHERE visa_id = @visaId ORDER BY date DESC
        ]], {
            ['@visaId'] = data.visaId
        })
        
        return {
            id = row.id,
            visaId = tostring(row.visaid),
            name = (row.name or '') .. ' ' .. (row.firstname or ''),
            phone = row.phone or 'N/A',
            registration = tostring(row.visaid),
            address = row.address,
            criminal_record = criminalRecord
        }
    end
    
    return nil
end)

vRP.registerRequest('citizens:addCriminalRecord', function(source, data)
    if not HasPolicePermission(source, 'citizens') then
        return { success = false }
    end
    
    local visaId = GetVisaIdFromSource(source)
    local identity = GetPlayerIdentity(visaId)
    local officerName = identity and (identity.name .. ' ' .. identity.firstname) or 'Sistema'
    
    MySQL.Sync.execute([[
        INSERT INTO police_criminal_records (visa_id, article, date, officer, fine, jail_time) 
        VALUES (@visaId, @article, @date, @officer, @fine, @jailTime)
    ]], {
        ['@visaId'] = data.visaId,
        ['@article'] = data.record.article,
        ['@date'] = os.date('%Y-%m-%d %H:%M:%S'),
        ['@officer'] = officerName,
        ['@fine'] = data.record.fine or 0,
        ['@jailTime'] = data.record.jailTime or 0
    })
    
    local insertId = MySQL.Sync.fetchScalar('SELECT LAST_INSERT_ID()')
    return { success = true, id = insertId }
end)

vRP.registerRequest('citizens:getCriminalRecord', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT * FROM police_criminal_records WHERE visa_id = @visaId ORDER BY date DESC
    ]], {
        ['@visaId'] = data.visaId
    })
    
    return result
end)

vRP.registerRequest('citizens:applyFine', function(source, data)
    if not HasPolicePermission(source, 'citizens') then
        return { success = false }
    end
    
    -- Aplica multa via vRP
    local targetUserId = tonumber(data.visaId)
    if targetUserId then
        vRP.tryPayment(targetUserId, data.value)
        
        -- Registra na ficha criminal
        local visaId = GetVisaIdFromSource(source)
        local identity = GetPlayerIdentity(visaId)
        local officerName = identity and (identity.name .. ' ' .. identity.firstname) or 'Sistema'
        
        MySQL.Async.execute([[
            INSERT INTO police_criminal_records (visa_id, article, date, officer, fine, jail_time) 
            VALUES (@visaId, @article, @date, @officer, @fine, 0)
        ]], {
            ['@visaId'] = data.visaId,
            ['@article'] = data.article,
            ['@date'] = os.date('%Y-%m-%d %H:%M:%S'),
            ['@officer'] = officerName,
            ['@fine'] = data.value
        })
        
        return { success = true }
    end
    
    return { success = false }
end)

vRP.registerRequest('citizens:applyJail', function(source, data)
    if not HasPolicePermission(source, 'citizens') then
        return { success = false }
    end
    
    -- Prende via vRP/vrpex
    local targetUserId = tonumber(data.visaId)
    local targetSource = vRP.getUserSource(targetUserId)
    
    if targetSource then
        -- Teleporta para prisão (adapte as coordenadas)
        vRPclient.teleport(targetSource, {1691.55, 2565.93, 45.56})
        
        -- Registra na ficha criminal
        local visaId = GetVisaIdFromSource(source)
        local identity = GetPlayerIdentity(visaId)
        local officerName = identity and (identity.name .. ' ' .. identity.firstname) or 'Sistema'
        
        MySQL.Async.execute([[
            INSERT INTO police_criminal_records (visa_id, article, date, officer, fine, jail_time) 
            VALUES (@visaId, @article, @date, @officer, 0, @jailTime)
        ]], {
            ['@visaId'] = data.visaId,
            ['@article'] = data.article,
            ['@date'] = os.date('%Y-%m-%d %H:%M:%S'),
            ['@officer'] = officerName,
            ['@jailTime'] = data.time
        })
        
        return { success = true }
    end
    
    return { success = false }
end)

-- ============================================
-- VEÍCULOS (VRPex)
-- ============================================

vRP.registerRequest('vehicles:getAll', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT v.*, i.name, i.firstname, i.visaid 
        FROM vrp_user_vehicles v 
        LEFT JOIN vrp_user_identities i ON v.user_id = i.user_id 
        LIMIT 100
    ]], {})
    
    local vehicles = {}
    for _, row in ipairs(result) do
        table.insert(vehicles, {
            id = row.id,
            plate = row.vehicle_plate or 'SEM PLACA',
            model = row.vehicle_name or row.vehicle,
            owner = (row.name or '') .. ' ' .. (row.firstname or ''),
            ownerVisaId = tostring(row.visaid),
            garage = row.garage or 'Desconhecida',
            status = row.irregular == 1 and 'Irregular' or 'Regular',
            irregular = row.irregular == 1,
            irregularReason = row.irregular_reason
        })
    end
    
    return vehicles
end)

vRP.registerRequest('vehicles:search', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT v.*, i.name, i.firstname, i.visaid 
        FROM vrp_user_vehicles v 
        LEFT JOIN vrp_user_identities i ON v.user_id = i.user_id 
        WHERE v.vehicle_plate LIKE @plate
    ]], {
        ['@plate'] = '%' .. data.plate .. '%'
    })
    
    local vehicles = {}
    for _, row in ipairs(result) do
        table.insert(vehicles, {
            id = row.id,
            plate = row.vehicle_plate or 'SEM PLACA',
            model = row.vehicle_name or row.vehicle,
            owner = (row.name or '') .. ' ' .. (row.firstname or ''),
            ownerVisaId = tostring(row.visaid),
            garage = row.garage or 'Desconhecida',
            status = row.irregular == 1 and 'Irregular' or 'Regular',
            irregular = row.irregular == 1
        })
    end
    
    return vehicles
end)

vRP.registerRequest('vehicles:getDetails', function(source, data)
    local result = MySQL.Sync.fetchAll([[
        SELECT v.*, i.name, i.firstname, i.visaid 
        FROM vrp_user_vehicles v 
        LEFT JOIN vrp_user_identities i ON v.user_id = i.user_id 
        WHERE v.vehicle_plate = @plate
    ]], {
        ['@plate'] = data.plate
    })
    
    if result[1] then
        local row = result[1]
        return {
            id = row.id,
            plate = row.vehicle_plate,
            model = row.vehicle_name or row.vehicle,
            owner = (row.name or '') .. ' ' .. (row.firstname or ''),
            ownerVisaId = tostring(row.visaid),
            garage = row.garage or 'Desconhecida',
            status = row.irregular == 1 and 'Irregular' or 'Regular',
            irregular = row.irregular == 1,
            irregularReason = row.irregular_reason
        }
    end
    
    return nil
end)

vRP.registerRequest('vehicles:markIrregular', function(source, data)
    if not HasPolicePermission(source, 'vehicles') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute([[
        UPDATE vrp_user_vehicles SET irregular = 1, irregular_reason = @reason 
        WHERE vehicle_plate = @plate
    ]], {
        ['@plate'] = data.plate,
        ['@reason'] = data.reason
    })
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('vehicles:clearIrregular', function(source, data)
    if not HasPolicePermission(source, 'vehicles') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute([[
        UPDATE vrp_user_vehicles SET irregular = 0, irregular_reason = NULL 
        WHERE vehicle_plate = @plate
    ]], {
        ['@plate'] = data.plate
    })
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('vehicles:seize', function(source, data)
    if not HasPolicePermission(source, 'vehicles') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute([[
        UPDATE vrp_user_vehicles SET seized = 1, seized_reason = @reason, seized_date = NOW() 
        WHERE vehicle_plate = @plate
    ]], {
        ['@plate'] = data.plate,
        ['@reason'] = data.reason
    })
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('vehicles:release', function(source, data)
    if not HasPolicePermission(source, 'vehicles') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute([[
        UPDATE vrp_user_vehicles SET seized = 0, seized_reason = NULL, seized_date = NULL 
        WHERE vehicle_plate = @plate
    ]], {
        ['@plate'] = data.plate
    })
    
    return { success = rowsChanged > 0 }
end)

-- ============================================
-- RECRUTAMENTO (VRPex)
-- ============================================

vRP.registerRequest('recruitment:getAll', function(source, data)
    local result = MySQL.Sync.fetchAll('SELECT * FROM police_recruitment ORDER BY created_at DESC', {})
    
    local recruitments = {}
    for _, row in ipairs(result) do
        table.insert(recruitments, {
            id = row.id,
            visaId = tostring(row.visa_id),
            name = row.name,
            grade = row.grade or 0,
            status = row.status,
            updatedBy = row.updated_by,
            updatedAt = row.updated_at,
            notes = row.notes
        })
    end
    
    return recruitments
end)

vRP.registerRequest('recruitment:add', function(source, data)
    if not HasPolicePermission(source, 'recruitment') then
        return { success = false }
    end
    
    local adminVisaId = GetVisaIdFromSource(source)
    local adminIdentity = GetPlayerIdentity(adminVisaId)
    local adminName = adminIdentity and (adminIdentity.name .. ' ' .. adminIdentity.firstname) or 'Sistema'
    
    MySQL.Sync.execute([[
        INSERT INTO police_recruitment (visa_id, name, grade, status, updated_by, updated_at, notes, created_at) 
        VALUES (@visaId, @name, 0, 'Pendente', @updatedBy, @updatedAt, @notes, NOW())
    ]], {
        ['@visaId'] = data.visaId,
        ['@name'] = data.name,
        ['@updatedBy'] = adminName,
        ['@updatedAt'] = os.date('%d/%m/%Y'),
        ['@notes'] = data.notes or ''
    })
    
    local insertId = MySQL.Sync.fetchScalar('SELECT LAST_INSERT_ID()')
    return { success = true, id = insertId }
end)

vRP.registerRequest('recruitment:updateStatus', function(source, data)
    if not HasPolicePermission(source, 'recruitment') then
        return { success = false }
    end
    
    local adminVisaId = GetVisaIdFromSource(source)
    local adminIdentity = GetPlayerIdentity(adminVisaId)
    local adminName = adminIdentity and (adminIdentity.name .. ' ' .. adminIdentity.firstname) or 'Sistema'
    
    local params = {
        ['@id'] = data.recruitmentId,
        ['@status'] = data.status,
        ['@updatedBy'] = adminName,
        ['@updatedAt'] = os.date('%d/%m/%Y')
    }
    
    local query = 'UPDATE police_recruitment SET status = @status, updated_by = @updatedBy, updated_at = @updatedAt'
    
    if data.grade then
        query = query .. ', grade = @grade'
        params['@grade'] = data.grade
    end
    
    query = query .. ' WHERE id = @id'
    
    local rowsChanged = MySQL.Sync.execute(query, params)
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('recruitment:approve', function(source, data)
    if not HasPolicePermission(source, 'recruitment') then
        return { success = false }
    end
    
    -- Busca dados do candidato
    local recruitment = MySQL.Sync.fetchAll('SELECT * FROM police_recruitment WHERE id = @id', {
        ['@id'] = data.recruitmentId
    })
    
    if recruitment[1] then
        local candidate = recruitment[1]
        
        -- Adiciona como funcionário (Soldado)
        MySQL.Sync.execute([[
            INSERT INTO police_employees (visa_id, name, rank_id, is_on_duty, bulletins_created, is_recruiter) 
            VALUES (@visaId, @name, @rankId, 0, 0, 0)
        ]], {
            ['@visaId'] = candidate.visa_id,
            ['@name'] = candidate.name,
            ['@rankId'] = #Config.Ranks -- Última patente (Soldado)
        })
        
        -- Adiciona grupo no vRP
        vRP.addUserGroup(tonumber(candidate.visa_id), 'Soldado')
        
        -- Atualiza status do recrutamento
        local adminVisaId = GetVisaIdFromSource(source)
        local adminIdentity = GetPlayerIdentity(adminVisaId)
        local adminName = adminIdentity and (adminIdentity.name .. ' ' .. adminIdentity.firstname) or 'Sistema'
        
        MySQL.Sync.execute([[
            UPDATE police_recruitment 
            SET status = 'Aprovado', updated_by = @updatedBy, updated_at = @updatedAt 
            WHERE id = @id
        ]], {
            ['@id'] = data.recruitmentId,
            ['@updatedBy'] = adminName,
            ['@updatedAt'] = os.date('%d/%m/%Y')
        })
        
        return { success = true }
    end
    
    return { success = false }
end)

vRP.registerRequest('recruitment:reject', function(source, data)
    if not HasPolicePermission(source, 'recruitment') then
        return { success = false }
    end
    
    local adminVisaId = GetVisaIdFromSource(source)
    local adminIdentity = GetPlayerIdentity(adminVisaId)
    local adminName = adminIdentity and (adminIdentity.name .. ' ' .. adminIdentity.firstname) or 'Sistema'
    
    local rowsChanged = MySQL.Sync.execute([[
        UPDATE police_recruitment 
        SET status = 'Reprovado', updated_by = @updatedBy, updated_at = @updatedAt, rejection_reason = @reason 
        WHERE id = @id
    ]], {
        ['@id'] = data.recruitmentId,
        ['@updatedBy'] = adminName,
        ['@updatedAt'] = os.date('%d/%m/%Y'),
        ['@reason'] = data.reason or 'Não especificado'
    })
    
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('recruitment:delete', function(source, data)
    if not HasPolicePermission(source, 'recruitment') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute('DELETE FROM police_recruitment WHERE id = @id', {
        ['@id'] = data.recruitmentId
    })
    
    return { success = rowsChanged > 0 }
end)

-- ============================================
-- CÓDIGO PENAL (VRPex)
-- ============================================

vRP.registerRequest('penalCode:getAll', function(source, data)
    local result = MySQL.Sync.fetchAll('SELECT * FROM police_penal_code ORDER BY category, article', {})
    
    local codes = {}
    for _, row in ipairs(result) do
        table.insert(codes, {
            id = row.id,
            article = row.article,
            title = row.title,
            description = row.description,
            penalty = row.penalty,
            fine = row.fine or 0,
            jailTime = row.jail_time or 0,
            category = row.category
        })
    end
    
    return codes
end)

vRP.registerRequest('penalCode:getArticle', function(source, data)
    local result = MySQL.Sync.fetchAll('SELECT * FROM police_penal_code WHERE article = @article', {
        ['@article'] = data.article
    })
    
    if result[1] then
        local row = result[1]
        return {
            id = row.id,
            article = row.article,
            title = row.title,
            description = row.description,
            penalty = row.penalty,
            fine = row.fine or 0,
            jailTime = row.jail_time or 0,
            category = row.category
        }
    end
    
    return nil
end)

vRP.registerRequest('penalCode:add', function(source, data)
    if not HasPolicePermission(source, 'penal-code') then
        return { success = false }
    end
    
    MySQL.Sync.execute([[
        INSERT INTO police_penal_code (article, title, description, penalty, fine, jail_time, category) 
        VALUES (@article, @title, @description, @penalty, @fine, @jailTime, @category)
    ]], {
        ['@article'] = data.article,
        ['@title'] = data.title,
        ['@description'] = data.description,
        ['@penalty'] = data.penalty,
        ['@fine'] = data.fine or 0,
        ['@jailTime'] = data.jailTime or 0,
        ['@category'] = data.category
    })
    
    local insertId = MySQL.Sync.fetchScalar('SELECT LAST_INSERT_ID()')
    return { success = true, id = insertId }
end)

vRP.registerRequest('penalCode:update', function(source, data)
    if not HasPolicePermission(source, 'penal-code') then
        return { success = false }
    end
    
    local setClause = {}
    local params = { ['@id'] = data.codeId }
    
    for key, value in pairs(data.data) do
        local dbKey = key
        if key == 'jailTime' then dbKey = 'jail_time' end
        table.insert(setClause, dbKey .. ' = @' .. key)
        params['@' .. key] = value
    end
    
    if #setClause > 0 then
        local rowsChanged = MySQL.Sync.execute('UPDATE police_penal_code SET ' .. table.concat(setClause, ', ') .. ' WHERE id = @id', params)
        return { success = rowsChanged > 0 }
    end
    
    return { success = false }
end)

vRP.registerRequest('penalCode:delete', function(source, data)
    if not HasPolicePermission(source, 'penal-code') then
        return { success = false }
    end
    
    local rowsChanged = MySQL.Sync.execute('DELETE FROM police_penal_code WHERE id = @id', {
        ['@id'] = data.codeId
    })
    
    return { success = rowsChanged > 0 }
end)

-- ============================================
-- AVISOS/ALERTAS (VRPex)
-- ============================================

vRP.registerRequest('alerts:get', function(source, data)
    local result = MySQL.Sync.fetchAll('SELECT * FROM police_alerts ORDER BY id DESC LIMIT 1', {})
    
    if result[1] then
        return {
            content = result[1].content,
            lastUpdate = result[1].last_update,
            updatedBy = result[1].updated_by
        }
    end
    
    return {
        content = '',
        lastUpdate = '',
        updatedBy = ''
    }
end)

vRP.registerRequest('alerts:update', function(source, data)
    if not HasPolicePermission(source, 'alerts') then
        return { success = false }
    end
    
    local visaId = GetVisaIdFromSource(source)
    local identity = GetPlayerIdentity(visaId)
    local playerName = identity and (identity.name .. ' ' .. identity.firstname) or 'Sistema'
    
    -- Verifica se já existe
    local existing = MySQL.Sync.fetchScalar('SELECT COUNT(*) FROM police_alerts')
    
    if existing > 0 then
        MySQL.Sync.execute([[
            UPDATE police_alerts SET content = @content, last_update = @lastUpdate, updated_by = @updatedBy 
            ORDER BY id DESC LIMIT 1
        ]], {
            ['@content'] = data.content,
            ['@lastUpdate'] = os.date('%d/%m/%Y %H:%M'),
            ['@updatedBy'] = playerName
        })
    else
        MySQL.Sync.execute([[
            INSERT INTO police_alerts (content, last_update, updated_by) 
            VALUES (@content, @lastUpdate, @updatedBy)
        ]], {
            ['@content'] = data.content,
            ['@lastUpdate'] = os.date('%d/%m/%Y %H:%M'),
            ['@updatedBy'] = playerName
        })
    end
    
    return { success = true }
end)

-- ============================================
-- MISSÕES (VRPex)
-- ============================================

vRP.registerRequest('missions:getAll', function(source, data)
    local result = MySQL.Sync.fetchAll('SELECT * FROM police_missions ORDER BY created_at DESC', {})
    
    local missions = {}
    for _, row in ipairs(result) do
        local assignedTo = MySQL.Sync.fetchAll([[
            SELECT visa_id FROM police_mission_officers WHERE mission_id = @id
        ]], { ['@id'] = row.id })
        
        local visaIds = {}
        for _, a in ipairs(assignedTo) do
            table.insert(visaIds, a.visa_id)
        end
        
        table.insert(missions, {
            id = row.id,
            title = row.title,
            description = row.description,
            status = row.status,
            assignedTo = visaIds,
            createdBy = row.created_by,
            createdAt = row.created_at,
            completedAt = row.completed_at,
            priority = row.priority or 'medium'
        })
    end
    
    return missions
end)

vRP.registerRequest('missions:create', function(source, data)
    if not HasPolicePermission(source, 'missions') then
        return { success = false }
    end
    
    local visaId = GetVisaIdFromSource(source)
    
    MySQL.Sync.execute([[
        INSERT INTO police_missions (title, description, status, created_by, created_at, priority) 
        VALUES (@title, @description, @status, @createdBy, NOW(), @priority)
    ]], {
        ['@title'] = data.title,
        ['@description'] = data.description,
        ['@status'] = data.status or 'pending',
        ['@createdBy'] = visaId,
        ['@priority'] = data.priority or 'medium'
    })
    
    local insertId = MySQL.Sync.fetchScalar('SELECT LAST_INSERT_ID()')
    
    -- Adiciona oficiais atribuídos
    if data.assignedTo then
        for _, visaId in ipairs(data.assignedTo) do
            MySQL.Async.execute([[
                INSERT INTO police_mission_officers (mission_id, visa_id) VALUES (@missionId, @visaId)
            ]], {
                ['@missionId'] = insertId,
                ['@visaId'] = visaId
            })
        end
    end
    
    return { success = true, id = insertId }
end)

vRP.registerRequest('missions:updateStatus', function(source, data)
    if not HasPolicePermission(source, 'missions') then
        return { success = false }
    end
    
    local query = 'UPDATE police_missions SET status = @status'
    local params = { ['@id'] = data.missionId, ['@status'] = data.status }
    
    if data.status == 'completed' then
        query = query .. ', completed_at = NOW()'
    end
    
    query = query .. ' WHERE id = @id'
    
    local rowsChanged = MySQL.Sync.execute(query, params)
    return { success = rowsChanged > 0 }
end)

vRP.registerRequest('missions:assign', function(source, data)
    if not HasPolicePermission(source, 'missions') then
        return { success = false }
    end
    
    for _, visaId in ipairs(data.visaIds) do
        MySQL.Async.execute([[
            INSERT IGNORE INTO police_mission_officers (mission_id, visa_id) VALUES (@missionId, @visaId)
        ]], {
            ['@missionId'] = data.missionId,
            ['@visaId'] = visaId
        })
    end
    
    return { success = true }
end)

vRP.registerRequest('missions:unassign', function(source, data)
    if not HasPolicePermission(source, 'missions') then
        return { success = false }
    end
    
    MySQL.Sync.execute([[
        DELETE FROM police_mission_officers WHERE mission_id = @missionId AND visa_id = @visaId
    ]], {
        ['@missionId'] = data.missionId,
        ['@visaId'] = data.visaId
    })
    
    return { success = true }
end)

vRP.registerRequest('missions:delete', function(source, data)
    if not HasPolicePermission(source, 'missions') then
        return { success = false }
    end
    
    MySQL.Sync.execute('DELETE FROM police_mission_officers WHERE mission_id = @id', { ['@id'] = data.missionId })
    local rowsChanged = MySQL.Sync.execute('DELETE FROM police_missions WHERE id = @id', { ['@id'] = data.missionId })
    
    return { success = rowsChanged > 0 }
end)

-- ============================================
-- RÁDIO/COMUNICAÇÃO (VRPex)
-- ============================================

vRP.registerRequest('radio:broadcast', function(source, data)
    local visaId = GetVisaIdFromSource(source)
    local identity = GetPlayerIdentity(visaId)
    local playerName = identity and (identity.name .. ' ' .. identity.firstname) or 'Desconhecido'
    
    -- Envia para todos policiais em serviço
    local onDuty = MySQL.Sync.fetchAll('SELECT visa_id FROM police_employees WHERE is_on_duty = 1', {})
    
    for _, officer in ipairs(onDuty) do
        local targetSource = vRP.getUserSource(officer.visa_id)
        if targetSource then
            vRPclient.notify(targetSource, {'~b~[RÁDIO] ' .. playerName .. ': ~w~' .. data.message})
        end
    end
    
    return { success = true }
end)

vRP.registerRequest('radio:emergency', function(source, data)
    local visaId = GetVisaIdFromSource(source)
    local identity = GetPlayerIdentity(visaId)
    local playerName = identity and (identity.name .. ' ' .. identity.firstname) or 'Desconhecido'
    
    -- Envia alerta para todos policiais
    local allOfficers = MySQL.Sync.fetchAll('SELECT visa_id FROM police_employees', {})
    
    for _, officer in ipairs(allOfficers) do
        local targetSource = vRP.getUserSource(officer.visa_id)
        if targetSource then
            vRPclient.notify(targetSource, {'~r~[EMERGÊNCIA] ' .. data.type .. '~w~\nLocal: ' .. data.location .. '\n' .. data.details})
        end
    end
    
    return { success = true }
end)

vRP.registerRequest('radio:backup', function(source, data)
    local visaId = GetVisaIdFromSource(source)
    local identity = GetPlayerIdentity(visaId)
    local playerName = identity and (identity.name .. ' ' .. identity.firstname) or 'Desconhecido'
    
    local priorityColors = {
        low = '~g~',
        medium = '~o~',
        high = '~r~'
    }
    
    local color = priorityColors[data.priority] or '~o~'
    
    -- Envia para todos policiais em serviço
    local onDuty = MySQL.Sync.fetchAll('SELECT visa_id FROM police_employees WHERE is_on_duty = 1', {})
    
    for _, officer in ipairs(onDuty) do
        local targetSource = vRP.getUserSource(officer.visa_id)
        if targetSource then
            vRPclient.notify(targetSource, {color .. '[REFORÇO SOLICITADO]~w~\nOficial: ' .. playerName .. '\nLocal: ' .. data.location})
        end
    end
    
    return { success = true }
end)

-- ============================================
-- LOGS (VRPex)
-- ============================================

vRP.registerRequest('logs:getAll', function(source, data)
    if not HasPolicePermission(source, 'positions') then
        return {}
    end
    
    local query = 'SELECT * FROM police_logs WHERE 1=1'
    local params = {}
    
    if data.filter then
        if data.filter.action then
            query = query .. ' AND action = @action'
            params['@action'] = data.filter.action
        end
        if data.filter.visaId then
            query = query .. ' AND (admin_visa_id = @visaId OR target_visa_id = @visaId)'
            params['@visaId'] = data.filter.visaId
        end
        if data.filter.startDate then
            query = query .. ' AND date >= @startDate'
            params['@startDate'] = data.filter.startDate
        end
        if data.filter.endDate then
            query = query .. ' AND date <= @endDate'
            params['@endDate'] = data.filter.endDate
        end
    end
    
    query = query .. ' ORDER BY date DESC LIMIT 100'
    
    local result = MySQL.Sync.fetchAll(query, params)
    
    local logs = {}
    for _, row in ipairs(result) do
        table.insert(logs, {
            id = row.id,
            action = row.action,
            visaId = tostring(row.admin_visa_id),
            details = row.reason,
            date = row.date
        })
    end
    
    return logs
end)