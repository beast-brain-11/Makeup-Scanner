(() => {
    let width = screen.width;
    let height = width / (4 / 3);
    let streaming = false;
    let video = null;
    let canvas = null;
    let scantext = null;
    let contibutton = null;
    let startbutton = null;
    let Img = null;
    let blob = null;
    let sendval = '';
    let flut = '';
    const unsafe = ["Oxybenzone","Avobenzone","Homosalate","Octinoxate","Octocrylene","Cinoxate","Parabens","formaldehyde","Carbon Black","Propylene Glycol","Phthalates"];
    const health = ["polyethylene glycols","methyl and propyl parabens","aluminum","formaldehyde","phthalates","oxybenozone"];
    const allergies = ["Amyl cinnamal","Amylcinnamyl alcohol","Anisyl alcohol","Benzyl alcohol","Benzyl benzoate","Benzyl cinnamate","Methylisothiazolinone","Methylchloroisothiazolinone (CMIT)"];
    let allg = true;
    let recogtext = '';

    function startup() {
        video = document.getElementById("video");
        canvas = document.getElementById("canvas");
        contibutton = document.getElementById("contibutton");
        scantext = document.getElementById("scannedtext");
        startbutton = document.getElementById("startbutton");
        Img = document.getElementById("stillImg");

        startbutton.style.left = "400px";
        contibutton.style.left = "620px";
        startbutton.style.top = "1300px";
        contibutton.style.top = "1300px";

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            });

        video.addEventListener(
            "canplay",
            (ev) => {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);

                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }

                    video.setAttribute("width", width);
                    video.setAttribute("height", height);
                    canvas.setAttribute("width", width);
                    canvas.setAttribute("height", height);

                    streaming = true;
                }
            },
            false
        );

        startbutton.addEventListener(
            "click",
            (ev) => {
                takepicture();
                ev.preventDefault();
            },
            false
        );
    }

    function takepicture() {
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, width, height);
        const data = canvas.toDataURL("image/png");
        blob = dataURLtoBlob(data);
        Img.setAttribute("src", data);
        video.remove();
        canvas.remove();
        Tesseract.recognize(blob).then(({ data: { text: ocrText } }) => {
            sendval = ocrText;
            scantext.innerHTML = sendval;
            recogtext = sendval.replace('\n', '');
            let tess = recogtext.split(',');
            tess[0] = tess[0].split(':')[1].trim();
            console.log(tess);
            let allergens;
            for (let i of tess) {
                i = i.trim();
                if (unsafe.includes(i)) {
                    flut = `Toxic ingredient ${i} used`;
                    allg = false;
                    break;
                } else if (health.includes(i)) {
                    flut = `Contains elements such as ${i} that could harm your skin`;
                    allg = false;
                    break;
                } else if (allergies.includes(i)) {
                    flut = `Contains common allergen ${i}`;
                    allg = false;
                    break;
                }
            }
            if (allg) {
                console.log("All Good");
            }
        });

        startbutton.style.left = "120px";
        startbutton.textContent = "Scan Again";
        contibutton.style.backgroundColor = "#6153BD";
        startbutton.addEventListener(
            "click",
            (ev) => {
                location.reload();
                ev.preventDefault();
            },
            false
        );
        contibutton.addEventListener(
            "click",
            (ev) => {
                scantext.innerHTML = flut;
                ev.preventDefault();
            },
            false
        );
    }

    function dataURLtoBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }

    window.addEventListener("load", startup, false);
})();
