Config = {}

-- Keybind para abrir o tablet (F7)
Config.OpenKey = 'F7'

-- Grupo VRPex permitido
Config.AllowedGroup = 'Policia'

-- Subgrupos/patentes e permissões
Config.Ranks = {
    { id = 1, name = 'Coronel', salary = 15000, permissions = {'all'} },
    { id = 2, name = 'Tenente-Coronel', salary = 12000, permissions = {'dashboard', 'occurrences', 'citizens', 'vehicles', 'recruitment', 'employees', 'penal-code'} },
    { id = 3, name = 'Major', salary = 10000, permissions = {'dashboard', 'occurrences', 'citizens', 'vehicles', 'recruitment'} },
    { id = 4, name = 'Capitão', salary = 8000, permissions = {'dashboard', 'occurrences', 'citizens', 'vehicles'} },
    { id = 5, name = 'Tenente', salary = 6000, permissions = {'dashboard', 'occurrences', 'citizens', 'vehicles'} },
    { id = 6, name = 'Sargento', salary = 4500, permissions = {'dashboard', 'occurrences', 'citizens'} },
    { id = 7, name = 'Cabo', salary = 3500, permissions = {'dashboard', 'occurrences'} },
    { id = 8, name = 'Soldado', salary = 2500, permissions = {'dashboard'} },
}

-- Cores das patentes
Config.RankColors = {
    ['Coronel'] = '#FFD700',
    ['Tenente-Coronel'] = '#C0C0C0',
    ['Major'] = '#CD7F32',
    ['Capitão'] = '#4169E1',
    ['Tenente'] = '#32CD32',
    ['Sargento'] = '#FF6347',
    ['Cabo'] = '#9370DB',
    ['Soldado'] = '#20B2AA',
}

-- Todas as permissões disponíveis
Config.AllPermissions = {
    'dashboard',
    'occurrences',
    'citizens',
    'vehicles',
    'recruitment',
    'missions',
    'positions',
    'employees',
    'service',
    'penal-code',
    'alerts'
}