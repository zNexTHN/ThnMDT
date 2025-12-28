local Tunnel = module("vrp", "lib/Tunnel")
local Proxy = module("vrp", "lib/Proxy")

vRP = Proxy.getInterface("vRP")
vRPclient = Tunnel.getInterface("vRP")

local isTabletOpen = false

-- ============================================
-- FUNÇÕES AUXILIARES VRPEX
-- ============================================

function GetPlayerVisaId()
    return vRP.visaId()
end

function GetPlayerName()
    local identity = vRP.getIdentity()
    if identity then
        return identity.name .. ' ' .. identity.firstname
    end
    return 'Desconhecido'
end

function GetPlayerGroup()
    local groups = vRP.getUserGroups()
    for group, _ in pairs(groups) do
        if string.find(group:lower(), 'policia') or string.find(group:lower(), 'police') then
            return group
        end
    end
    return nil
end

function GetPlayerRank()
    local groups = vRP.getUserGroups()
    for group, _ in pairs(groups) do
        for _, rank in ipairs(Config.Ranks) do
            if group == rank.name then
                return rank
            end
        end
    end
    return Config.Ranks[#Config.Ranks] -- Soldado por padrão
end

function IsPolice()
    local group = GetPlayerGroup()
    return group ~= nil
end

function GetPermissionsForRank(rankName)
    for _, rank in ipairs(Config.Ranks) do
        if rank.name == rankName then
            if rank.permissions[1] == 'all' then
                return Config.AllPermissions
            end
            return rank.permissions
        end
    end
    return {'dashboard'}
end

-- ============================================
-- ABRIR/FECHAR TABLET
-- ============================================

function OpenTablet()
    if isTabletOpen then return end
    
    if not IsPolice() then
        vRP.notify('~r~Você não é um policial!')
        return
    end
    
    isTabletOpen = true
    SetNuiFocus(true, true)
    
    local rank = GetPlayerRank()
    
    SendNUIMessage({
        type = 'tablet:open',
        playerData = {
            id = GetPlayerVisaId(),
            visaId = tostring(GetPlayerVisaId()),
            name = GetPlayerName(),
            rank = rank.name,
            rankId = rank.id,
            rankColor = Config.RankColors[rank.name] or '#FFFFFF',
            permissions = GetPermissionsForRank(rank.name),
            isOnDuty = exports['vrpex']:isOnDuty() or false
        }
    })
end

function CloseTablet()
    if not isTabletOpen then return end
    
    isTabletOpen = false
    SetNuiFocus(false, false)
    
    SendNUIMessage({
        type = 'tablet:close'
    })
end

-- Keybind
RegisterKeyMapping('policetablet', 'Abrir Tablet Policial', 'keyboard', Config.OpenKey)
RegisterCommand('policetablet', function()
    if isTabletOpen then
        CloseTablet()
    else
        OpenTablet()
    end
end, false)

-- ============================================
-- NUI CALLBACKS - SISTEMA GERAL
-- ============================================

RegisterNUICallback('tablet:close', function(data, cb)
    CloseTablet()
    cb({ success = true })
end)

RegisterNUICallback('tablet:getPlayerData', function(data, cb)
    local rank = GetPlayerRank()
    cb({
        id = GetPlayerVisaId(),
        visaId = tostring(GetPlayerVisaId()),
        name = GetPlayerName(),
        rank = rank.name,
        rankId = rank.id,
        rankColor = Config.RankColors[rank.name] or '#FFFFFF',
        permissions = GetPermissionsForRank(rank.name),
        isOnDuty = exports['vrpex']:isOnDuty() or false
    })
end)

RegisterNUICallback('tablet:getStats', function(data, cb)
    vRP.request('tablet:getStats', {}, function(stats)
        cb(stats)
    end)
end)

RegisterNUICallback('tablet:checkPermission', function(data, cb)
    local permissions = GetPermissionsForRank(GetPlayerRank().name)
    local hasPermission = false
    
    for _, perm in ipairs(permissions) do
        if perm == data.permission or perm == 'all' then
            hasPermission = true
            break
        end
    end
    
    cb({ hasPermission = hasPermission })
end)

RegisterNUICallback('tablet:getConfig', function(data, cb)
    cb({
        ranks = Config.Ranks,
        rankColors = Config.RankColors,
        permissions = Config.AllPermissions
    })
end)

-- ============================================
-- NUI CALLBACKS - PONTO/SERVIÇO (VRPex)
-- ============================================

RegisterNUICallback('duty:clockIn', function(data, cb)
    vRP.request('duty:clockIn', {}, function(result)
        if result.success then
            exports['vrpex']:setDuty(true)
            vRP.notify('~g~Ponto de entrada registrado!')
        end
        cb(result)
    end)
end)

RegisterNUICallback('duty:clockOut', function(data, cb)
    vRP.request('duty:clockOut', {}, function(result)
        if result.success then
            exports['vrpex']:setDuty(false)
            vRP.notify('~r~Ponto de saída registrado!')
        end
        cb(result)
    end)
end)

RegisterNUICallback('duty:getStatus', function(data, cb)
    vRP.request('duty:getStatus', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('duty:getOnDutyOfficers', function(data, cb)
    vRP.request('duty:getOnDutyOfficers', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('duty:force', function(data, cb)
    vRP.request('duty:force', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - CARGOS/PATENTES (VRPex)
-- ============================================

RegisterNUICallback('positions:getAll', function(data, cb)
    vRP.request('positions:getAll', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('positions:updatePermissions', function(data, cb)
    vRP.request('positions:updatePermissions', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('positions:updateSalary', function(data, cb)
    vRP.request('positions:updateSalary', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('positions:create', function(data, cb)
    vRP.request('positions:create', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('positions:delete', function(data, cb)
    vRP.request('positions:delete', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - FUNCIONÁRIOS (VRPex)
-- ============================================

RegisterNUICallback('employees:getAll', function(data, cb)
    vRP.request('employees:getAll', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:getDetails', function(data, cb)
    vRP.request('employees:getDetails', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:updateRank', function(data, cb)
    vRP.request('employees:updateRank', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:toggleRecruiter', function(data, cb)
    vRP.request('employees:toggleRecruiter', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:dismiss', function(data, cb)
    vRP.request('employees:dismiss', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:getClockHistory', function(data, cb)
    vRP.request('employees:getClockHistory', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:addWarning', function(data, cb)
    vRP.request('employees:addWarning', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:getWarnings', function(data, cb)
    vRP.request('employees:getWarnings', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - OCORRÊNCIAS (VRPex)
-- ============================================

RegisterNUICallback('occurrences:getAll', function(data, cb)
    vRP.request('occurrences:getAll', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:getDetails', function(data, cb)
    vRP.request('occurrences:getDetails', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:create', function(data, cb)
    vRP.request('occurrences:create', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:update', function(data, cb)
    vRP.request('occurrences:update', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:delete', function(data, cb)
    vRP.request('occurrences:delete', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:addOfficer', function(data, cb)
    vRP.request('occurrences:addOfficer', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:close', function(data, cb)
    vRP.request('occurrences:close', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - CIDADÃOS (VRPex)
-- ============================================

RegisterNUICallback('citizens:search', function(data, cb)
    vRP.request('citizens:search', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:getAll', function(data, cb)
    vRP.request('citizens:getAll', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:getDetails', function(data, cb)
    vRP.request('citizens:getDetails', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:update', function(data, cb)
    vRP.request('citizens:update', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:addCriminalRecord', function(data, cb)
    vRP.request('citizens:addCriminalRecord', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:getCriminalRecord', function(data, cb)
    vRP.request('citizens:getCriminalRecord', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:applyFine', function(data, cb)
    vRP.request('citizens:applyFine', data, function(result)
        if result.success then
            vRP.notify('~g~Multa aplicada com sucesso!')
        end
        cb(result)
    end)
end)

RegisterNUICallback('citizens:applyJail', function(data, cb)
    vRP.request('citizens:applyJail', data, function(result)
        if result.success then
            vRP.notify('~g~Prisão aplicada com sucesso!')
        end
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - VEÍCULOS (VRPex)
-- ============================================

RegisterNUICallback('vehicles:search', function(data, cb)
    vRP.request('vehicles:search', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:getAll', function(data, cb)
    vRP.request('vehicles:getAll', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:getDetails', function(data, cb)
    vRP.request('vehicles:getDetails', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:inspect', function(data, cb)
    vRP.request('vehicles:inspect', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:markIrregular', function(data, cb)
    vRP.request('vehicles:markIrregular', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:clearIrregular', function(data, cb)
    vRP.request('vehicles:clearIrregular', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:seize', function(data, cb)
    vRP.request('vehicles:seize', data, function(result)
        if result.success then
            vRP.notify('~g~Veículo apreendido!')
        end
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:release', function(data, cb)
    vRP.request('vehicles:release', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - RECRUTAMENTO (VRPex)
-- ============================================

RegisterNUICallback('recruitment:getAll', function(data, cb)
    vRP.request('recruitment:getAll', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:add', function(data, cb)
    vRP.request('recruitment:add', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:updateStatus', function(data, cb)
    vRP.request('recruitment:updateStatus', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:approve', function(data, cb)
    vRP.request('recruitment:approve', data, function(result)
        if result.success then
            vRP.notify('~g~Candidato aprovado e contratado!')
        end
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:reject', function(data, cb)
    vRP.request('recruitment:reject', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:delete', function(data, cb)
    vRP.request('recruitment:delete', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - CÓDIGO PENAL (VRPex)
-- ============================================

RegisterNUICallback('penalCode:getAll', function(data, cb)
    vRP.request('penalCode:getAll', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('penalCode:getArticle', function(data, cb)
    vRP.request('penalCode:getArticle', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('penalCode:add', function(data, cb)
    vRP.request('penalCode:add', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('penalCode:update', function(data, cb)
    vRP.request('penalCode:update', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('penalCode:delete', function(data, cb)
    vRP.request('penalCode:delete', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - AVISOS/ALERTAS (VRPex)
-- ============================================

RegisterNUICallback('alerts:get', function(data, cb)
    vRP.request('alerts:get', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('alerts:update', function(data, cb)
    vRP.request('alerts:update', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - MISSÕES (VRPex)
-- ============================================

RegisterNUICallback('missions:getAll', function(data, cb)
    vRP.request('missions:getAll', {}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:getDetails', function(data, cb)
    vRP.request('missions:getDetails', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:create', function(data, cb)
    vRP.request('missions:create', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:updateStatus', function(data, cb)
    vRP.request('missions:updateStatus', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:assign', function(data, cb)
    vRP.request('missions:assign', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:unassign', function(data, cb)
    vRP.request('missions:unassign', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:delete', function(data, cb)
    vRP.request('missions:delete', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - RÁDIO/COMUNICAÇÃO (VRPex)
-- ============================================

RegisterNUICallback('radio:broadcast', function(data, cb)
    vRP.request('radio:broadcast', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('radio:emergency', function(data, cb)
    vRP.request('radio:emergency', data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('radio:backup', function(data, cb)
    vRP.request('radio:backup', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - LOGS (VRPex)
-- ============================================

RegisterNUICallback('logs:getAll', function(data, cb)
    vRP.request('logs:getAll', data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- EVENTOS VRPEX
-- ============================================

-- Atualiza dados quando mudar de grupo
AddEventHandler('vrpex:groupChanged', function()
    if isTabletOpen then
        local rank = GetPlayerRank()
        SendNUIMessage({
            type = 'tablet:updatePlayerData',
            playerData = {
                rank = rank.name,
                rankId = rank.id,
                rankColor = Config.RankColors[rank.name] or '#FFFFFF',
                permissions = GetPermissionsForRank(rank.name)
            }
        })
    end
end)

-- Atualiza quando mudar status de duty
AddEventHandler('vrpex:dutyChanged', function(isOnDuty)
    if isTabletOpen then
        SendNUIMessage({
            type = 'tablet:updateDuty',
            isOnDuty = isOnDuty
        })
    end
end)