const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let pulse = 0;

// MediaPipe setup
const hands = new Hands({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6
});

hands.onResults(results => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        return;
    }

    const landmarks = results.multiHandLandmarks[0];

    const x = landmarks[8].x * canvas.width;
    const y = landmarks[8].y * canvas.height;

    drawTechPointer(x, y);
});

function drawTechPointer(x, y) {

    pulse += 0.1;
    const radius = 18 + Math.sin(pulse) * 4;

    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = "cyan";
    ctx.fillStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "cyan";

    // Main circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Dotted ring
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshair lines
    ctx.beginPath();
    ctx.moveTo(-radius - 12, 0);
    ctx.lineTo(-radius - 4, 0);
    ctx.moveTo(radius + 4, 0);
    ctx.lineTo(radius + 12, 0);

    ctx.moveTo(0, -radius - 12);
    ctx.lineTo(0, -radius - 4);
    ctx.moveTo(0, radius + 4);
    ctx.lineTo(0, radius + 12);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Camera start
const camera = new Camera(video, {
    onFrame: async () => {
        await hands.send({ image: video });
    },
    width: 640,
    height: 480
});

camera.start();
