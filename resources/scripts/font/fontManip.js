function setClamp(textElement, minSize, maxSize)
{
	const rootEM = 16;

    /* PX 
    minFontRem = minSize / 16;
    maxFontRem = maxSize / 16;
    */

    /* % */
    const minFontRem = Number(minSize.replace("%","")) / 100;
    let maxFontRem = Number(maxSize.replace("%","")) / 100;

    const maxWidthPX = 368;

    const canvas = setClamp.canvas || (setClamp.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = rootEM + "px " + $(textElement).css("font-family");

    const remCharWidth = (context.measureText("a")).width;
    const maxCharWidth = maxWidthPX / textElement[0].innerText.length;
    const maxFontPX = (rootEM * maxCharWidth) / remCharWidth;

    const minWidthRem = (context.measureText(textElement[0].innerText)).width / rootEM;
    const maxWidthRem = maxWidthPX / rootEM;

    maxFontRem = Math.min(maxFontPX / rootEM,maxFontRem);

    let slope = (maxFontRem - minFontRem) / (maxWidthRem - minWidthRem);
    let yAxis = (-1 * minWidthRem) * slope + 1;

    $(textElement).css("font-size","clamp(" + minFontRem + "rem, " + yAxis + "rem + " + (slope * 100) + "vw, " + maxFontRem + "rem)");
}