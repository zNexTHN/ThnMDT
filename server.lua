local Tunnel = module("vrp", "lib/Tunnel")
local Proxy = module("vrp", "lib/Proxy")

vRP = Proxy.getInterface("vRP")
vRPclient = Tunnel.getInterface("vRP")

-- Definição da interface do nosso script
src = {}
Tunnel.bindInterface("ThnMDT", src)

-- ============================================
-- PREPARAÇÃO SQL (vRPex Padrão)
-- ============================================
-- Certifique-se que suas tabelas SQL existem no banco de dados com esses nomes.

vRP.prepare("ThnMDT/get_stats_bulletins", "SELECT COUNT(*) as qtd FROM police_occurrences")
vRP.prepare("ThnMDT/get_stats_officers", "SELECT COUNT(*) as qtd FROM police_employees")
vRP.prepare("ThnMDT/get_stats_onduty", "SELECT COUNT(*) as qtd FROM police_employees WHERE is_on_duty = 1")
vRP.prepare("ThnMDT/get_stats_recruitment", "SELECT COUNT(*) as qtd FROM police_recruitment WHERE status = 'Pendente'")
vRP.prepare("ThnMDT/get_stats_pending", "SELECT COUNT(*) as qtd FROM police_occurrences WHERE status = 'Aberto'")

vRP.prepare("ThnMDT/update_duty", "UPDATE police_employees SET is_on_duty = @status, last_clock_in = @time WHERE visa_id = @visaId")
vRP.prepare("ThnMDT/update_duty_out", "UPDATE police_employees SET is_on_duty = 0 WHERE visa_id = @visaId")
vRP.prepare("ThnMDT/insert_clock_history", "INSERT INTO police_clock_history (visa_id, type, date) VALUES (@visaId, @type, @date)")
vRP.prepare("ThnMDT/get_employee_duty", "SELECT is_on_duty, last_clock_in FROM police_employees WHERE visa_id = @visaId")

vRP.prepare("ThnMDT/get_onduty_officers", "SELECT e.*, r.name as rank_name, r.color as rank_color FROM police_employees e LEFT JOIN police_ranks r ON e.rank_id = r.id WHERE e.is_on_duty = 1")

vRP.prepare("ThnMDT/get_all_positions", "SELECT r.*, (SELECT COUNT(*) FROM police_employees WHERE rank_id = r.id) as officer_count FROM police_ranks r ORDER BY r.id ASC")
vRP.prepare("ThnMDT/update_position_perms", "UPDATE police_ranks SET permissions = @permissions WHERE id = @id")
vRP.prepare("ThnMDT/update_position_salary", "UPDATE police_ranks SET salary = @salary WHERE id = @id")
vRP.prepare("ThnMDT/insert_position", "INSERT INTO police_ranks (name, salary, color, permissions) VALUES (@name, @salary, @color, @permissions)")
vRP.prepare("ThnMDT/delete_position", "DELETE FROM police_ranks WHERE id = @id")

vRP.prepare("ThnMDT/get_all_employees", "SELECT e.*, r.name as rank_name, r.color as rank_color FROM police_employees e LEFT JOIN police_ranks r ON e.rank_id = r.id ORDER BY e.rank_id ASC")
vRP.prepare("ThnMDT/get_employee_details", "SELECT e.*, r.name as rank_name, r.color as rank_color FROM police_employees e LEFT JOIN police_ranks r ON e.rank_id = r.id WHERE e.visa_id = @visaId")
vRP.prepare("ThnMDT/get_employee_history", "SELECT type, date FROM police_clock_history WHERE visa_id = @visaId ORDER BY date DESC LIMIT 50")
vRP.prepare("ThnMDT/update_employee_rank", "UPDATE police_employees SET rank_id = @rankId WHERE visa_id = @visaId")
vRP.prepare("ThnMDT/get_rank_name", "SELECT name FROM police_ranks WHERE id = @id")
vRP.prepare("ThnMDT/update_recruiter", "UPDATE police_employees SET is_recruiter = @value WHERE visa_id = @visaId")
vRP.prepare("ThnMDT/get_is_recruiter", "SELECT is_recruiter FROM police_employees WHERE visa_id = @visaId")
vRP.prepare("ThnMDT/delete_employee", "DELETE FROM police_employees WHERE visa_id = @visaId")
vRP.prepare("ThnMDT/insert_log", "INSERT INTO police_logs (action, admin_visa_id, target_visa_id, reason, date) VALUES (@action, @admin, @target, @reason, @date)")
vRP.prepare("ThnMDT/insert_warning", "INSERT INTO police_warnings (visa_id, reason, date, issued_by) VALUES (@visaId, @reason, @date, @issuedBy)")
vRP.prepare("ThnMDT/get_warnings", "SELECT id, reason, date, issued_by as issuedBy FROM police_warnings WHERE visa_id = @visaId ORDER BY date DESC")

vRP.prepare("ThnMDT/get_all_occurrences", "SELECT * FROM police_occurrences ORDER BY created_at DESC")
vRP.prepare("ThnMDT/get_occurrence", "SELECT * FROM police_occurrences WHERE id = @id")
vRP.prepare("ThnMDT/get_occurrence_officers", "SELECT e.visa_id, e.name FROM police_occurrence_officers oo JOIN police_employees e ON oo.visa_id = e.visa_id WHERE oo.occurrence_id = @id")
vRP.prepare("ThnMDT/insert_occurrence", "INSERT INTO police_occurrences (title, date, requester, opened_by, opened_at, description, status, created_at) VALUES (@title, @date, @requester, @openedBy, @openedAt, @description, @status, NOW())")
vRP.prepare("ThnMDT/inc_bulletins", "UPDATE police_employees SET bulletins_created = bulletins_created + 1 WHERE visa_id = @visaId")
vRP.prepare("ThnMDT/update_occurrence_status", "UPDATE police_occurrences SET status = 'Fechado', resolution = @resolution, closed_at = NOW() WHERE id = @id")
vRP.prepare("ThnMDT/delete_occurrence", "DELETE FROM police_occurrences WHERE id = @id")
vRP.prepare("ThnMDT/add_officer_occurrence", "INSERT IGNORE INTO police_occurrence_officers (occurrence_id, visa_id) VALUES (@occurrenceId, @visaId)")

vRP.prepare("ThnMDT/get_all_identities", "SELECT user_id as id, user_id as visa_id, name, firstname, phone, registration FROM vrp_user_identities LIMIT 100")
vRP.prepare("ThnMDT/search_identities", "SELECT user_id as id, user_id as visa_id, name, firstname, phone, registration FROM vrp_user_identities WHERE name LIKE @query OR firstname LIKE @query OR user_id LIKE @query OR registration LIKE @query LIMIT 50")
vRP.prepare("ThnMDT/get_identity", "SELECT user_id as id, user_id as visaid, name, firstname, phone, registration, age FROM vrp_user_identities WHERE user_id = @visaId")
vRP.prepare("ThnMDT/get_criminal_records", "SELECT * FROM police_criminal_records WHERE visa_id = @visaId ORDER BY date DESC")
vRP.prepare("ThnMDT/insert_criminal_record", "INSERT INTO police_criminal_records (visa_id, article, date, officer, fine, jail_time) VALUES (@visaId, @article, @date, @officer, @fine, @jailTime)")

vRP.prepare("ThnMDT/get_all_vehicles", "SELECT v.*, i.name, i.firstname, i.user_id as visaid FROM vrp_user_vehicles v LEFT JOIN vrp_user_identities i ON v.user_id = i.user_id LIMIT 100")
vRP.prepare("ThnMDT/search_vehicles", "SELECT v.*, i.name, i.firstname, i.user_id as visaid FROM vrp_user_vehicles v LEFT JOIN vrp_user_identities i ON v.user_id = i.user_id WHERE v.vehicle_plate LIKE @plate")
vRP.prepare("ThnMDT/get_vehicle", "SELECT v.*, i.name, i.firstname, i.user_id as visaid FROM vrp_user_vehicles v LEFT JOIN vrp_user_identities i ON v.user_id = i.user_id WHERE v.vehicle_plate = @plate")
vRP.prepare("ThnMDT/update_vehicle_irregular", "UPDATE vrp_user_vehicles SET irregular = @irregular, irregular_reason = @reason WHERE vehicle_plate = @plate")
vRP.prepare("ThnMDT/update_vehicle_seized", "UPDATE vrp_user_vehicles SET seized = @seized, seized_reason = @reason, seized_date = @date WHERE vehicle_plate = @plate")

vRP.prepare("ThnMDT/get_recruitments", "SELECT * FROM police_recruitment ORDER BY created_at DESC")
vRP.prepare("ThnMDT/insert_recruitment", "INSERT INTO police_recruitment (visa_id, name, grade, status, updated_by, updated_at, notes, created_at) VALUES (@visaId, @name, 0, 'Pendente', @updatedBy, @updatedAt, @notes, NOW())")
vRP.prepare("ThnMDT/update_recruitment_status", "UPDATE police_recruitment SET status = @status, updated_by = @updatedBy, updated_at = @updatedAt WHERE id = @id")
vRP.prepare("ThnMDT/insert_employee_from_recruitment", "INSERT INTO police_employees (visa_id, name, rank_id, is_on_duty, bulletins_created, is_recruiter) VALUES (@visaId, @name, @rankId, 0, 0, 0)")
vRP.prepare("ThnMDT/update_recruitment_reject", "UPDATE police_recruitment SET status = 'Reprovado', updated_by = @updatedBy, updated_at = @updatedAt, rejection_reason = @reason WHERE id = @id")
vRP.prepare("ThnMDT/delete_recruitment", "DELETE FROM police_recruitment WHERE id = @id")

vRP.prepare("ThnMDT/get_penalcode", "SELECT * FROM police_penal_code ORDER BY category, article")
vRP.prepare("ThnMDT/get_penalcode_article", "SELECT * FROM police_penal_code WHERE article = @article")
vRP.prepare("ThnMDT/insert_penalcode", "INSERT INTO police_penal_code (article, title, description, penalty, fine, jail_time, category) VALUES (@article, @title, @description, @penalty, @fine, @jailTime, @category)")
vRP.prepare("ThnMDT/delete_penalcode", "DELETE FROM police_penal_code WHERE id = @id")

vRP.prepare("ThnMDT/get_alerts", "SELECT * FROM police_alerts ORDER BY id DESC LIMIT 1")
vRP.prepare("ThnMDT/count_alerts", "SELECT COUNT(*) as qtd FROM police_alerts")
vRP.prepare("ThnMDT/update_alerts", "UPDATE police_alerts SET content = @content, last_update = @lastUpdate, updated_by = @updatedBy ORDER BY id DESC LIMIT 1")
vRP.prepare("ThnMDT/insert_alerts", "INSERT INTO police_alerts (content, last_update, updated_by) VALUES (@content, @lastUpdate, @updatedBy)")

vRP.prepare("ThnMDT/get_missions", "SELECT * FROM police_missions ORDER BY created_at DESC")
vRP.prepare("ThnMDT/get_mission_officers", "SELECT visa_id FROM police_mission_officers WHERE mission_id = @id")
vRP.prepare("ThnMDT/insert_mission", "INSERT INTO police_missions (title, description, status, created_by, created_at, priority) VALUES (@title, @description, @status, @createdBy, NOW(), @priority)")
vRP.prepare("ThnMDT/insert_mission_officer", "INSERT INTO police_mission_officers (mission_id, visa_id) VALUES (@missionId, @visaId)")
vRP.prepare("ThnMDT/update_mission_status", "UPDATE police_missions SET status = @status WHERE id = @id")
vRP.prepare("ThnMDT/delete_mission_officer", "DELETE FROM police_mission_officers WHERE mission_id = @missionId AND visa_id = @visaId")
vRP.prepare("ThnMDT/delete_mission_officers_all", "DELETE FROM police_mission_officers WHERE mission_id = @id")
vRP.prepare("ThnMDT/delete_mission", "DELETE FROM police_missions WHERE id = @id")

vRP.prepare("ThnMDT/get_logs", "SELECT * FROM police_logs ORDER BY date DESC LIMIT 100")


-- ============================================
-- HELPERS LOCAIS
-- ============================================

local function GetPlayerGroup(user_id)
    -- Lógica simples de verificação. Ajuste conforme seus grupos do vRPex
    if vRP.hasGroup(user_id, "policia.coronel") then return "Coronel" end
    if vRP.hasGroup(user_id, "policia.tenente") then return "Tenente" end
    -- Adicione seus grupos aqui ou use a lógica do Config.Ranks se os nomes baterem
    for _, rank in ipairs(Config.Ranks) do
        if vRP.hasGroup(user_id, rank.name) then
            return rank.name
        end
    end
    return nil
end

local function GetPlayerRank(user_id)
    local groupName = GetPlayerGroup(user_id)
    if groupName then
        for _, rank in ipairs(Config.Ranks) do
            if rank.name == groupName then
                return rank
            end
        end
    end
    return Config.Ranks[#Config.Ranks] -- Default Soldado
end

local function HasPolicePermission(user_id, permission)
    local rank = GetPlayerRank(user_id)
    if not rank then return false end
    
    if rank.permissions[1] == 'all' then return true end
    
    for _, perm in ipairs(rank.permissions) do
        if perm == permission then return true end
    end
    return false
end

-- ============================================
-- FUNÇÕES EXPORTADAS (TUNNEL)
-- ============================================

function src.openTabletRequest()
    local source = source
    local user_id = vRP.getUserId(source)
    if not user_id then return false, {} end

    -- if not GetPlayerGroup(user_id) then
    --     return false, {}
    -- end

    local identity = vRP.getUserIdentity(user_id)
    local rank = GetPlayerRank(user_id)
    local isOnDuty = vRP.hasGroup(user_id, "EmServico") -- Exemplo de verificação de duty

    return true, {
        id = user_id,
        visaId = tostring(user_id),
        name = identity.name .. ' ' .. identity.firstname,
        rank = rank.name,
        rankId = rank.id,
        rankColor = Config.RankColors[rank.name] or '#FFFFFF',
        permissions = rank.permissions,
        isOnDuty = isOnDuty
    }
end

function src.getPlayerData()
    local source = source
    local user_id = vRP.getUserId(source)
    if not user_id then return {} end

    local identity = vRP.getUserIdentity(user_id)
    local rank = GetPlayerRank(user_id)
    
    return {
        id = user_id,
        visaId = tostring(user_id),
        name = identity.name .. ' ' .. identity.firstname,
        rank = rank.name,
        rankId = rank.id,
        rankColor = Config.RankColors[rank.name] or '#FFFFFF',
        permissions = rank.permissions,
        isOnDuty = vRP.hasGroup(user_id, "EmServico")
    }
end

function src.getStats()
    local bulletins = vRP.query("ThnMDT/get_stats_bulletins", {})[1].qtd
    local officers = vRP.query("ThnMDT/get_stats_officers", {})[1].qtd
    local onDuty = vRP.query("ThnMDT/get_stats_onduty", {})[1].qtd
    local activeRecruitments = vRP.query("ThnMDT/get_stats_recruitment", {})[1].qtd
    local pendingOccurrences = vRP.query("ThnMDT/get_stats_pending", {})[1].qtd
    
    return {
        bulletins = bulletins or 0,
        officers = officers or 0,
        onDuty = onDuty or 0,
        activeRecruitments = activeRecruitments or 0,
        pendingOccurrences = pendingOccurrences or 0
    }
end

function src.checkPermission(data)
    local source = source
    local user_id = vRP.getUserId(source)
    return HasPolicePermission(user_id, data.permission)
end

-- ============================================
-- PONTO/SERVIÇO
-- ============================================

function src.clockIn()
    local source = source
    local user_id = vRP.getUserId(source)
    local time = os.date('%d/%m/%Y %H:%M')
    
    vRP.execute("ThnMDT/update_duty", { status = 1, time = time, visaId = user_id })
    vRP.execute("ThnMDT/insert_clock_history", { visaId = user_id, type = 'in', date = time })
    
    -- Aqui você pode adicionar o grupo de serviço do vRP se usar
    -- vRP.addUserGroup(user_id, "Policia")
    
    return { success = true, time = time }
end

function src.clockOut()
    local source = source
    local user_id = vRP.getUserId(source)
    local time = os.date('%d/%m/%Y %H:%M')
    
    vRP.execute("ThnMDT/update_duty_out", { visaId = user_id })
    vRP.execute("ThnMDT/insert_clock_history", { visaId = user_id, type = 'out', date = time })
    
    -- vRP.removeUserGroup(user_id, "Policia")
    
    return { success = true, time = time }
end

function src.getDutyStatus()
    local source = source
    local user_id = vRP.getUserId(source)
    
    local rows = vRP.query("ThnMDT/get_employee_duty", { visaId = user_id })
    if #rows > 0 then
        return {
            isOnDuty = rows[1].is_on_duty == 1,
            clockInTime = rows[1].last_clock_in
        }
    end
    return { isOnDuty = false }
end

function src.getOnDutyOfficers()
    local rows = vRP.query("ThnMDT/get_onduty_officers", {})
    local officers = {}
    
    for _, row in ipairs(rows) do
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
end

function src.forceDuty(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'employees') then return { success = false } end
    
    vRP.execute("ThnMDT/update_duty", { 
        status = data.status and 1 or 0, 
        visaId = data.visaId,
        time = os.date('%d/%m/%Y %H:%M') -- Atualiza hora se forçar entrada
    })
    
    return { success = true }
end

-- ============================================
-- CARGOS
-- ============================================

function src.getAllPositions()
    local rows = vRP.query("ThnMDT/get_all_positions", {})
    local positions = {}
    for _, row in ipairs(rows) do
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
end

function src.createPosition(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'positions') then return { success = false } end
    
    vRP.execute("ThnMDT/insert_position", {
        name = data.name,
        salary = tonumber(string.gsub(data.salary, '[^0-9]', '')) or 0,
        color = data.color,
        permissions = json.encode(data.permissions)
    })
    return { success = true }
end

function src.updatePositionPermissions(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'positions') then return { success = false } end
    
    vRP.execute("ThnMDT/update_position_perms", {
        id = data.positionId,
        permissions = json.encode(data.permissions)
    })
    return { success = true }
end

function src.deletePosition(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'positions') then return { success = false } end
    
    vRP.execute("ThnMDT/delete_position", { id = data.positionId })
    return { success = true }
end

-- ============================================
-- FUNCIONÁRIOS
-- ============================================

function src.getAllEmployees()
    local rows = vRP.query("ThnMDT/get_all_employees", {})
    local employees = {}
    for _, row in ipairs(rows) do
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
end

function src.getEmployeeDetails(data)
    local rows = vRP.query("ThnMDT/get_employee_details", { visaId = data.visaId })
    if #rows > 0 then
        local row = rows[1]
        local history = vRP.query("ThnMDT/get_employee_history", { visaId = data.visaId })
        
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
            clockHistory = history
        }
    end
    return nil
end

function src.updateEmployeeRank(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'employees') then return { success = false } end
    
    vRP.execute("ThnMDT/update_employee_rank", { visaId = data.visaId, rankId = data.newRankId })
    
    -- Atualiza grupo vRP
    local rankNameRows = vRP.query("ThnMDT/get_rank_name", { id = data.newRankId })
    if #rankNameRows > 0 then
        local target_id = tonumber(data.visaId)
        -- Remover grupos antigos (logica customizada necessária aqui dependendo do seu sistema de grupos)
        for _, r in ipairs(Config.Ranks) do
            if vRP.hasGroup(target_id, r.name) then
                vRP.removeUserGroup(target_id, r.name)
            end
        end
        vRP.addUserGroup(target_id, rankNameRows[1].name)
    end
    
    return { success = true }
end

function src.dismissEmployee(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'employees') then return { success = false } end
    
    vRP.execute("ThnMDT/delete_employee", { visaId = data.visaId })
    
    -- Remover grupos
    local target_id = tonumber(data.visaId)
    for _, r in ipairs(Config.Ranks) do
        vRP.removeUserGroup(target_id, r.name)
    end
    
    -- Log
    vRP.execute("ThnMDT/insert_log", {
        action = 'DISMISS',
        admin = user_id,
        target = data.visaId,
        reason = data.reason or 'Não especificado',
        date = os.date('%Y-%m-%d %H:%M:%S')
    })
    
    return { success = true }
end

-- ============================================
-- OCORRÊNCIAS
-- ============================================

function src.getAllOccurrences()
    local rows = vRP.query("ThnMDT/get_all_occurrences", {})
    return rows -- A estrutura do banco já bate com o esperado pelo JS, mas pode precisar formatar a data
end

function src.createOccurrence(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'occurrences') then return { success = false } end
    
    local identity = vRP.getUserIdentity(user_id)
    local playerName = identity.name .. ' ' .. identity.firstname
    
    vRP.execute("ThnMDT/insert_occurrence", {
        title = data.title,
        date = os.date('%Y-%m-%d'),
        requester = data.requester,
        openedBy = playerName,
        openedAt = os.date('%d/%m/%Y %H:%M'),
        description = data.description or '',
        status = 'Aberto'
    })
    
    vRP.execute("ThnMDT/inc_bulletins", { visaId = user_id })
    
    return { success = true }
end

-- ============================================
-- CIDADÃOS
-- ============================================

function src.searchCitizens(data)
    local rows = vRP.query("ThnMDT/search_identities", { query = "%" .. data.query .. "%" })
    local citizens = {}
    for _, row in ipairs(rows) do
        table.insert(citizens, {
            id = row.id,
            visaId = tostring(row.visa_id),
            name = (row.name or '') .. ' ' .. (row.firstname or ''),
            phone = row.phone or 'N/A',
            registration = tostring(row.registration or row.visa_id)
        })
    end
    return citizens
end

function src.getCitizenDetails(data)
    local rows = vRP.query("ThnMDT/get_identity", { visaId = data.visaId })
    if #rows > 0 then
        local row = rows[1]
        local criminal = vRP.query("ThnMDT/get_criminal_records", { visaId = data.visaId })
        
        return {
            id = row.id,
            visaId = tostring(row.visaid),
            name = (row.name or '') .. ' ' .. (row.firstname or ''),
            phone = row.phone or 'N/A',
            registration = tostring(row.registration or row.visaid),
            age = row.age,
            criminal_record = criminal
        }
    end
    return nil
end

function src.applyFine(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'citizens') then return { success = false } end
    
    local target_id = tonumber(data.visaId)
    if target_id then
        if vRP.tryFullPayment(target_id, data.value) then
            -- Sucesso no pagamento (se player online) ou desconta do banco? vRP standard desconta da mão/banco
            local identity = vRP.getUserIdentity(user_id)
            local officerName = identity.name .. ' ' .. identity.firstname
            
            vRP.execute("ThnMDT/insert_criminal_record", {
                visaId = data.visaId,
                article = data.article,
                date = os.date('%Y-%m-%d %H:%M:%S'),
                officer = officerName,
                fine = data.value,
                jailTime = 0
            })
            return { success = true }
        else
            return { success = false, message = "Cidadão sem dinheiro." }
        end
    end
    return { success = false }
end

function src.applyJail(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not HasPolicePermission(user_id, 'citizens') then return { success = false } end
    
    local target_id = tonumber(data.visaId)
    local target_source = vRP.getUserSource(target_id)
    
    if target_source then
        vRPclient._teleport(target_source, 1691.55, 2565.93, 45.56) -- Coordenadas da prisão
        -- Aqui você chamaria o script de prisão do vRPex: vRP.setUData(target_id, "vRP:jail", json.encode(data.time))
        
        local identity = vRP.getUserIdentity(user_id)
        local officerName = identity.name .. ' ' .. identity.firstname
        
        vRP.execute("ThnMDT/insert_criminal_record", {
            visaId = data.visaId,
            article = data.article,
            date = os.date('%Y-%m-%d %H:%M:%S'),
            officer = officerName,
            fine = 0,
            jailTime = data.time
        })
        return { success = true }
    end
    return { success = false, message = "Cidadão não encontrado na cidade." }
end

-- ============================================
-- VEÍCULOS
-- ============================================

function src.searchVehicles(data)
    local rows = vRP.query("ThnMDT/search_vehicles", { plate = "%"..data.plate.."%" })
    local vehicles = {}
    for _, row in ipairs(rows) do
        table.insert(vehicles, {
            id = row.id or 0,
            plate = row.vehicle_plate or 'SEM PLACA',
            model = row.vehicle_name or row.vehicle,
            owner = (row.name or '') .. ' ' .. (row.firstname or ''),
            ownerVisaId = tostring(row.visaid),
            status = row.irregular == 1 and 'Irregular' or 'Regular',
            irregular = row.irregular == 1
        })
    end
    return vehicles
end

-- ============================================
-- RÁDIO
-- ============================================

function src.radioBroadcast(data)
    local source = source
    local user_id = vRP.getUserId(source)
    local identity = vRP.getUserIdentity(user_id)
    local name = identity.name .. ' ' .. identity.firstname
    
    local officers = vRP.query("ThnMDT/get_onduty_officers", {})
    for _, off in ipairs(officers) do
        local tSource = vRP.getUserSource(tonumber(off.visa_id))
        if tSource then
            TriggerClientEvent("Notify", tSource, "azul", "[RÁDIO] " .. name .. ": " .. data.message)
        end
    end
    return { success = true }
end

-- (Adicione as demais funções do server.lua original seguindo este padrão src.nomeFuncao)