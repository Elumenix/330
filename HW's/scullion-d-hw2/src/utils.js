const makeColor = (red, green, blue, alpha = 1) => {
  return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min, max) => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = () => {
  const floor = 35; // so that colors are not too bright or too dark 
  const getByte = () => getRandom(floor, 255 - floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getLinearGradient = (ctx, canvasWidth, canvasHeight, gradientData) => {

  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;


  // First one is tricky because it doesn't carry a consecutive 90 degrees
  if (gradientData.angle <= 45 || gradientData.angle >= 315) {
    if (gradientData.angle <= 45) {
      endY = canvasHeight / 2 + (canvasHeight / 2) * (gradientData.angle / 45);
      startY = canvasHeight - endY;
    } else {
      startY = canvasHeight - (canvasHeight / 2) * ((gradientData.angle - 315) / (360 - 315));
      endY = canvasHeight - startY;
    }

    endX = canvasWidth;
    startX = canvasWidth - endX;
  }
  else if (gradientData.angle >= 135 && gradientData.angle <= 225) {
    startY = canvasHeight * ((gradientData.angle - 135) / (225 - 135));
    endY = canvasHeight - startY;
    startX = canvasWidth;
    endX = 0;
  }
  else if (gradientData.angle >= 45 && gradientData.angle <= 135) {
    startX = canvasWidth * ((gradientData.angle - 45) / (135 - 45));
    endX = canvasWidth - startX;
    startY = 0;
    endY = canvasHeight;
  }
  else if (gradientData.angle >= 225 && gradientData.angle <= 315) {
    startY = canvasHeight;
    endY = 0;
    endX = canvasWidth * ((gradientData.angle - 225) / (315 - 225));
    startX = canvasWidth - endX;
  }



  console.log(`startX: ${startX}, startY: ${startY}, endX: ${endX}, endY: ${endY}`);

  // Create the linear gradient
  let lg = ctx.createLinearGradient(startX, startY, endX, endY);

  // Add the color stops to the gradient
  for (let stop of gradientData.colorStops) {
    lg.addColorStop(stop.percent, stop.color);
  }

  return lg;
};


// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
const goFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullscreen) {
    element.mozRequestFullscreen();
  } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
  // .. and do nothing if the method is not supported
};

export { makeColor, getRandomColor, getLinearGradient, goFullscreen };
