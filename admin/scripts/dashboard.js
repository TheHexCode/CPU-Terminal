function jobCodeChange()
{
    $("#slugSelect").prop("selectedIndex", -1);
    let selectedCode = $("#jobSelect").prop("selectedOptions")[0].value;

    $("#slugSelect optgroup").prop("hidden", true);
    $("#slugSelect optgroup[data-code='" + selectedCode + "']").prop("hidden", false);

    $("#slugSelect").prop("disabled",false);

    $("#editTermButton").prop("disabled",true);
}

function slugChange(target)
{
    $("#editTermButton").prop("disabled",false);
}