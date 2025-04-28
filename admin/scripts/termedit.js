var entryCount = {
    files: [],
    darkweb: [],
    cameras: [],
    locks: [],
    defenses: [],
    utilities: []
}

function addEntry(event)
{
    event.preventDefault();

    $(event.target).before('<div class="entry">'+
                                '<div class="entryControls">' +
                                    '<div class="upControls">' +
                                        '<button>&barwedge;</button>' +
                                        '<button>&wedge;</button>' +
                                    '</div>' +
                                    '<button class="delButton">&times;</button>' +
                                    '<div class="downControls">' +
                                        '<button>&vee;</button>' +
                                        '<button>&veebar;</button>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="entryID">' +
                                    '01' +
                                '</div>' +
                                '<div class="entryGrid">' +
                                    '<div class="entryTypeRow">' +
                                        '<span class="entryTypeLabel">ENTRY TYPE:</span>' +
                                        '<select class="entryType">' +
                                            '<option>ENTRY</option>' +
                                            '<option>TRAP</option>' +
                                            '<option>ICE</option>' +
                                        '</select>' +
                                    '</div>' +
                                    '<div class="entryLabelRow">' +
                                        '<span class="entryLabel entryAccess">ACCESS COST</span>' +
                                        '<span class="entryLabel entryModify">MODIFY COST</span>' +
                                        '<span class="entryLabel entryTitle">TITLE</span>' +
                                        '<span class="entryLabel entryContents">CONTENTS</span>' +
                                    '</div>' +
                                    '<div class="entryInputRow">' +
                                        '<input class="entryAccess" type="number" value="0" />' +
                                        '<input class="entryModify" type="number" value="0" />' +
                                        '<input class="entryTitle" type="text" />' +
                                        '<input class="entryContents" type="text" />' +
                                    '</div>' +
                                '</div>' +
                            '</div>'
                        );
}