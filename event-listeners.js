landingLoadEvent = new Event('load');
gameStartEvent = new Event('gameStart');

const startButton = document.getElementById('start');

startButton.addEventListener('click', () => {
    // dispath gameStartEvent
    document.dispatchEvent(gameStartEvent);
    landingCanvas.classList.add('fadeout');
});

landingCanvas = document.getElementById('sketchCanvas');
document.onload = () => {
    console.log('load');
    landingCanvas.dispatchEvent(landingLoadEvent);
}