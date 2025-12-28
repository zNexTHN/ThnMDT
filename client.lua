local Tunnel = module("vrp", "lib/Tunnel")
local Proxy = module("vrp", "lib/Proxy")

vRP = Proxy.getInterface("vRP")
vRPclient = Tunnel.getInterface("vRP")
-- Conecta com o nosso server-side refatorado
vSERVER = Tunnel.getInterface("ThnMDT")

local isTabletOpen = false

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Nota: No Client vRPex padrão, não temos acesso direto a todos os grupos do usuário facilmente sem perguntar ao server.
-- Vamos confiar que o Server valide as ações, mas usaremos os dados que o servidor enviar ao abrir o tablet para a UI.

function IsPolice()
    -- Esta verificação deve ser feita no server, mas podemos manter uma verificação simples se você tiver o group manager no client
    -- Caso contrário, vamos confiar na resposta do servidor ao tentar abrir.
    return true 
end

-- ============================================
-- ABRIR/FECHAR TABLET
-- ============================================

function OpenTablet()
    if isTabletOpen then return end
    
    -- Chama o servidor para verificar permissão e pegar dados iniciais

    print("Rodando!")
    local canOpen, playerData = vSERVER.openTabletRequest()
    print(canOpen,playerData)
    if canOpen then
        isTabletOpen = true
        SetNuiFocus(true, true)
        
        print(json.encode(playerData))
        SendNUIMessage({
            type = 'tablet:open',
            playerData = playerData
        })
    else
        print("~r~Você não tem permissão ou não é policial.")
    end
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
    vSERVER.getPlayerData({}, function(playerData)
        cb(playerData)
    end)
end)

RegisterNUICallback('tablet:getStats', function(data, cb)
    vSERVER.getStats({}, function(stats)
        cb(stats)
    end)
end)

RegisterNUICallback('tablet:checkPermission', function(data, cb)
    -- Verificação rápida no client baseada no que recebemos ao abrir, 
    -- mas idealmente o server valida a ação final.
    vSERVER.checkPermission({ permission = data.permission }, function(hasPermission)
        cb({ hasPermission = hasPermission })
    end)
end)

RegisterNUICallback('tablet:getConfig', function(data, cb)
    cb({
        ranks = Config.Ranks,
        rankColors = Config.RankColors,
        permissions = Config.AllPermissions
    })
end)

-- ============================================
-- NUI CALLBACKS - PONTO/SERVIÇO (Duty)
-- ============================================

RegisterNUICallback('duty:clockIn', function(data, cb)
    vSERVER.clockIn({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('duty:clockOut', function(data, cb)
    vSERVER.clockOut({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('duty:getStatus', function(data, cb)
    vSERVER.getDutyStatus({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('duty:getOnDutyOfficers', function(data, cb)
    vSERVER.getOnDutyOfficers({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('duty:force', function(data, cb)
    vSERVER.forceDuty(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - CARGOS/PATENTES
-- ============================================

RegisterNUICallback('positions:getAll', function(data, cb)
    vSERVER.getAllPositions({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('positions:updatePermissions', function(data, cb)
    vSERVER.updatePositionPermissions(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('positions:updateSalary', function(data, cb)
    vSERVER.updatePositionSalary(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('positions:create', function(data, cb)
    vSERVER.createPosition(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('positions:delete', function(data, cb)
    vSERVER.deletePosition(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - FUNCIONÁRIOS
-- ============================================

RegisterNUICallback('employees:getAll', function(data, cb)
    vSERVER.getAllEmployees({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:getDetails', function(data, cb)
    vSERVER.getEmployeeDetails(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:updateRank', function(data, cb)
    vSERVER.updateEmployeeRank(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:toggleRecruiter', function(data, cb)
    vSERVER.toggleRecruiter(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:dismiss', function(data, cb)
    vSERVER.dismissEmployee(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:getClockHistory', function(data, cb)
    vSERVER.getClockHistory(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:addWarning', function(data, cb)
    vSERVER.addWarning(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('employees:getWarnings', function(data, cb)
    vSERVER.getWarnings(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - OCORRÊNCIAS
-- ============================================

RegisterNUICallback('occurrences:getAll', function(data, cb)
    vSERVER.getAllOccurrences({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:getDetails', function(data, cb)
    vSERVER.getOccurrenceDetails(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:create', function(data, cb)
    vSERVER.createOccurrence(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:update', function(data, cb)
    vSERVER.updateOccurrence(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:delete', function(data, cb)
    vSERVER.deleteOccurrence(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:addOfficer', function(data, cb)
    vSERVER.addOfficerToOccurrence(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('occurrences:close', function(data, cb)
    vSERVER.closeOccurrence(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - CIDADÃOS
-- ============================================

RegisterNUICallback('citizens:search', function(data, cb)
    vSERVER.searchCitizens(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:getAll', function(data, cb)
    vSERVER.getAllCitizens({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:getDetails', function(data, cb)
    vSERVER.getCitizenDetails(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:addCriminalRecord', function(data, cb)
    vSERVER.addCriminalRecord(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:getCriminalRecord', function(data, cb)
    vSERVER.getCriminalRecord(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:applyFine', function(data, cb)
    vSERVER.applyFine(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('citizens:applyJail', function(data, cb)
    vSERVER.applyJail(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - VEÍCULOS
-- ============================================

RegisterNUICallback('vehicles:search', function(data, cb)
    vSERVER.searchVehicles(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:getAll', function(data, cb)
    vSERVER.getAllVehicles({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:getDetails', function(data, cb)
    vSERVER.getVehicleDetails(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:markIrregular', function(data, cb)
    vSERVER.markVehicleIrregular(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:clearIrregular', function(data, cb)
    vSERVER.clearVehicleIrregular(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:seize', function(data, cb)
    vSERVER.seizeVehicle(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('vehicles:release', function(data, cb)
    vSERVER.releaseVehicle(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - RECRUTAMENTO
-- ============================================

RegisterNUICallback('recruitment:getAll', function(data, cb)
    vSERVER.getAllRecruitments({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:add', function(data, cb)
    vSERVER.addRecruitment(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:updateStatus', function(data, cb)
    vSERVER.updateRecruitmentStatus(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:approve', function(data, cb)
    vSERVER.approveRecruitment(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:reject', function(data, cb)
    vSERVER.rejectRecruitment(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('recruitment:delete', function(data, cb)
    vSERVER.deleteRecruitment(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - CÓDIGO PENAL
-- ============================================

RegisterNUICallback('penalCode:getAll', function(data, cb)
    vSERVER.getAllPenalCode({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('penalCode:getArticle', function(data, cb)
    vSERVER.getPenalCodeArticle(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('penalCode:add', function(data, cb)
    vSERVER.addPenalCode(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('penalCode:update', function(data, cb)
    vSERVER.updatePenalCode(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('penalCode:delete', function(data, cb)
    vSERVER.deletePenalCode(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - AVISOS/ALERTAS
-- ============================================

RegisterNUICallback('alerts:get', function(data, cb)
    vSERVER.getAlerts({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('alerts:update', function(data, cb)
    vSERVER.updateAlerts(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - MISSÕES
-- ============================================

RegisterNUICallback('missions:getAll', function(data, cb)
    vSERVER.getAllMissions({}, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:create', function(data, cb)
    vSERVER.createMission(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:updateStatus', function(data, cb)
    vSERVER.updateMissionStatus(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:assign', function(data, cb)
    vSERVER.assignMission(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:unassign', function(data, cb)
    vSERVER.unassignMission(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('missions:delete', function(data, cb)
    vSERVER.deleteMission(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - RÁDIO
-- ============================================

RegisterNUICallback('radio:broadcast', function(data, cb)
    vSERVER.radioBroadcast(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('radio:emergency', function(data, cb)
    vSERVER.radioEmergency(data, function(result)
        cb(result)
    end)
end)

RegisterNUICallback('radio:backup', function(data, cb)
    vSERVER.radioBackup(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- NUI CALLBACKS - LOGS
-- ============================================

RegisterNUICallback('logs:getAll', function(data, cb)
    vSERVER.getAllLogs(data, function(result)
        cb(result)
    end)
end)

-- ============================================
-- EVENTOS SERVER -> CLIENT
-- ============================================

RegisterNetEvent('tablet:updateDuty')
AddEventHandler('tablet:updateDuty', function(isOnDuty)
    if isTabletOpen then
        SendNUIMessage({
            type = 'tablet:updateDuty',
            isOnDuty = isOnDuty
        })
    end
end)