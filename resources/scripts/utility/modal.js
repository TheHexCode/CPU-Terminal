export class Modal
{
    _modalHTML = `
        <div id="modalBG">
			<div id="!modalID!" class="modalBox">
				<div class="modalHeaderRow">
					<span class="modalHeaderText"></span>
					<span class="modalClose" onpointerup="closeModal(event)" onkeyup="closeModal(event)">&#xf1398;</span>
				</div>
				<div class="modalBody">
					<div class="modalBodyText">
					</div>
				</div>
			</div>
		</div>
    `

    constructor(modalID)
    {

    }
}