// Configuration for units that should automatically fire weapons
var unitsToCommand = [["/pa/units/land/t_metal_extractor_0/t_metal_extractor_0.json", "altFireSelf"],["/pa/units/land/t_metal_extractor_01/t_metal_extractor_01.json", "altFireSelf"]];

// Weapon command function - handles automatic weapon firing
function unitCommand(unitId, unitState, commandType){
    if(commandType == "altFireSelf"){
        var order = {
            units: [unitId],
            command: 'fire_secondary_weapon',
            location: {      
                planet: unitState.planet,
                multi_pos: [unitState.pos, unitState.pos]
            },                       
            queue: true
        };
        api.getWorldView(0).sendOrder(order);
    }
}

// Enhanced doCommand function - now handles both patrol and weapon commands
function doCommand(world, id, planet, usedIdArray, commandType){ 
    var two = !_.isArray(id);
    if (two){
        id = [id];
    }

    if (world){ 
        return world.getUnitState(id).then(function (ready) {
            var unitData = this.result;
            var one = !_.isArray(unitData);
            if (one){
                unitData = [unitData];
            }
            
            for(var i = 0; i < unitData.length; i++){
                if(_.contains(usedIdArray, id[i]) !== true){
                    if (unitData[i].built_frac == undefined){
                        
                        // Handle weapon commands
                        if(commandType){
                            unitCommand(id[i], unitData[i], commandType);
                        } else {
                            // Original patrol command
                            api.getWorldView(0).sendOrder({
                                units: id[i],
                                command: 'patrol',
                                location: {planet: unitData[i].planet, pos: unitData[i].pos},
                                queue: false
                            });
                        }
                        
                        usedIdArray.push(id[i]);
                    }	
                }	
            }
            return usedIdArray;
        });
    } else {
        return;
    }
};

// Process weapon units specifically
function processWeaponUnits(worldView, army, chosenPlanet) {
    unitsToCommand.forEach(function(unitCommandArray){
        var unitSpec = unitCommandArray[0];
        var unitCommand = unitCommandArray[1];
        
        if (army.hasOwnProperty(unitSpec)) {
            doCommand(worldView, army[unitSpec], chosenPlanet, [], unitCommand);
        }
    });
}

// Existing variables
var idArray = [];
var advancedIdArray = [];
var legionIdArray = [];
var advancedLegionIdArray = [];
var chosenPlanet = 0;

var automation = function () { 
    var worldView = api.getWorldView(0);
    var armyindex = model.armyIndex();
    if (typeof armyindex == "undefined"){
        armyindex = model.armyId();
    }

    if (worldView) {
        if(model){
            var planets = model.planetListState();
            for(planet in planets.planets){
                planet = planets.planets[planet];
                if(planet.id !== undefined || planet.id === 0){
                    chosenPlanet = planet.index;
                    
                    worldView.getArmyUnits(armyindex, chosenPlanet).then(function (ready) {
                        var army = this.result;
                        
                        // Process weapon units first
                        processWeaponUnits(worldView, army, chosenPlanet);
                        
                        // Original fab tower automation
                        if (army.hasOwnProperty('/pa/units/structures/fab_complex/adv_fab_turret.json')) {
                            doCommand(worldView, army['/pa/units/structures/fab_complex/adv_fab_turret.json'], chosenPlanet, advancedIdArray).then(function (result) { advancedIdArray = result });
                        }
                        
                    });
                }
            }
        }
        
        _.delay(automation, 5000);
    } else {
        _.delay(automation, 5000);
    }
};

automation();