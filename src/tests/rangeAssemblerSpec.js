describe("range assembler", function() {

    var updates;

    beforeEach(function(){
        // Load some dummy updates
        updates = [
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35092505, createdAt:new Date('December 17, 2015 03:20:00')},
            {DeviceID: 'Press1', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35098505, createdAt:new Date('December 17, 2015 03:25:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35098505, createdAt:new Date('December 17, 2015 03:30:00')},
            {DeviceID: 'Press1', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100505, createdAt:new Date('December 17, 2015 03:35:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100605, createdAt:new Date('December 17, 2015 03:40:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100605, createdAt:new Date('December 17, 2015 03:45:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100605, createdAt:new Date('December 17, 2015 03:50:00')},
            {DeviceID: 'Press1', DeviceStatus: "Running",StatusDetails: "Indigo: Printing", SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100605, createdAt:new Date('December 17, 2015 03:55:00')},
            {DeviceID: 'Press1', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press1", SignalType: "SignalStatus",ProductionCounter: 35100705, createdAt:new Date('December 17, 2015 04:00:00')},
          ];

        //var forLater = {DeviceID: 'Press2', DeviceStatus: "Idle",StatusDetails: "Indigo: Ready",       SignalID: "SJDFSpy_Detail-Press2", SignalType: "SignalStatus",ProductionCounter: 25098505, createdAt:new Date('December 17, 2015 03:30:00')};


            });

});