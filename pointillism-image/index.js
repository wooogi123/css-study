class App {
  constructor() {
    this.canvas = document.createElement('canvas');
    document.body.append(this.canvas);

    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    window.addEventListener('resize', this.resize.bind(this), false);
    this.resize();
    this._canvasInit();
  }
  
  _canvasInit() {
    this.canvas.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    this.canvas.addEventListener('drop', (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0] ?? null;
      file && this._getFile(file);
    });

    this.canvas.addEventListener('image', (event) => {
      const { detail } = event;
      this.image = detail;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const context = tempCanvas.getContext('2d');
      context.drawImage(
        detail,
        0, 0,
        tempCanvas.width, tempCanvas.height,
      );
      this.data = context.getImageData(
        0, 0,
        tempCanvas.width, tempCanvas.height,
      ).data;

      this.amount = 4;
      this.speed = 0.5 / (this.amount * this.amount);
      this.size = this.amount * 0.8;

      this.height = Math.floor((this.canvas.height - this.amount) / this.amount / 2) + 1
      this.width = Math.floor((this.canvas.width - this.amount) / this.amount / 2) + 1;
      
      const shuf =
        (arr) => arr
          .map((v) => ([Math.random(), v]))
          .sort((prev, next) => prev[0] - next[0])
          .map((v) => v[1]);

      this.indices = shuf(Array(this.width * this.height).fill(0).map((_, index) => index));
      this.lastIndex = 0;
      this.beginTime = undefined;
      this.animate();
    });
  }

  _getFile(file) {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      image.src = event.target.result;
      image.onload = () => {
        const params = {
          detail: image,
          bubbles: true,
        };

        const event = new CustomEvent('image', params);
        this.canvas.dispatchEvent(event);
      };
    };

    reader.readAsDataURL(file);
  }

  resize() {
    const { clientWidth, clientHeight } = document.body;

    this.canvas.width = clientWidth * this.pixelRatio;
    this.canvas.height = clientHeight * this.pixelRatio;

    this.context?.scale(this.pixelRatio, this.pixelRatio);
  }

  animate(t) {
    requestAnimationFrame(this.animate.bind(this));

    this.visual(t);
  }

  visual(t) {
    this.context = this.canvas.getContext('2d');

    const { width, height, amount, size, indices, speed } = this;

    if (this.beginTime === undefined) {
      this.beginTime = t;
      this.lastIndex = 0;
    }
    const dt = t - this.beginTime;

    const dest = Math.min(width * height, Math.floor(dt / speed));

    for (let j = this.lastIndex; j < dest; j++) {
      const i = indices[j];
      const x = (i % width) * (2 * amount) + amount;
      const y = Math.floor(i / width) * (2 * amount) + amount;
      const index = ((y * this.canvas.width) + x) * 4;
      const [r, g, b] = this.data.slice(index, index + 3);
      const color = `rgb(${r}, ${g}, ${b})`;

      this.context.clearRect(x, y, size, size);
      this.context.beginPath();
      this.context.arc(x, y, size, 0, 360, false);
      this.context.fillStyle = color;
      this.context.fill();
    }

    this.lastIndex = dest;

    /*
    let i = 0;
    let j = 0;
    for (let y = amount; y < this.canvas.height; y += amount * 2, i++) {
      for (let x = amount; x < this.canvas.width; x += amount * 2, j++) {
        const index = ((y * this.canvas.width) + x) * 4;
        const [r, g, b] = this.data.slice(index, index + 3);
        const color = `rgb(${r}, ${g}, ${b})`;

        this.context.beginPath();
        this.context.arc(x, y, size, 0, 360, false);
        this.context.fillStyle = color;
        this.context.fill();
      }
    }
    */
  }
}

(function() {
  window.onload = () => {
    new App();
  }
})();
