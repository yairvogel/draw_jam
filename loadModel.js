let classifier;

const loadModel = async () => {
    classifier = await tf.loadLayersModel('modelv2/model.json');
    window.dispatchEvent(new CustomEvent('modelLoaded'));
    window.dispatchEvent(new CustomEvent('turnChanged', { detail: { turn: "player" } }));
}

loadModel();