var RangeAssembler = function () {

    var model = this;

    model.updates = [];

    model.getFirstUpdate = function(){
        return model.updates[0];
    };

    model.getLastUpdate = function(){
        return model.updates[model.updates.length-1];
    };

    model.getStatusDetails = function(){
        return model.updates[0].StatusDetails;
    };

    model.getPress = function(){
        return model.updates[0].DeviceID;
    };

    model.getTimeDifference = function(unit){
        var ms = Math.abs( model.getLastUpdate().createdAt - model.getFirstUpdate().createdAt );

        if(unit === 'ms'){
            return ms;
        } else if(unit === 'sec'){
            return (ms/1000);
        } else if(unit === 'min'){
            return (ms/1000/60);
        } else {
            return false;
        }
    };

    model.getClicksDifference = function(){
        return Math.abs( model.getLastUpdate().ProductionCounter - model.getFirstUpdate().ProductionCounter );
    };

    model.getRange =  function(){
         return {
            statusDetails: model.getStatusDetails(),
            id: model.getFirstUpdate()._id,
            elapsedClicks: model.getClicksDifference(),
            diffMs: model.getTimeDifference('ms'),
            diffSec: model.getTimeDifference('sec'),
            diffMin: model.getTimeDifference('min'),
            start: model.getFirstUpdate().createdAt.getTime(),
            end: model.getLastUpdate().createdAt.getTime(),
            updates: model.updates.length,
            press: model.getPress()
        };
    };

};

module.exports = RangeAssembler;