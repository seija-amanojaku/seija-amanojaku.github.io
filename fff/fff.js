function decode_rgb565(px) {
    let r = ((px >> 11) & 0b011111);
    let g = ((px >>  5) & 0b111111);
    let b = ((px >>  0) & 0b011111);
    let r8 = r << 3;
    let g8 = g << 2;
    let b8 = b << 3;

    return [r8,g8,b8];
}
function write_raw16(ctx, px16_array) {
    const imageData = ctx.getImageData(0, 0, 396, 224);
    const data = imageData.data;
    for (let y = 0; y < 224; y++) {
        for (let x = 0; x < 396; x++) {
            let idx = (x + y * 396) << 2;
            let c32 = decode_rgb565(px16_array[idx>>2]);
            data[idx+0] = c32[0];
            data[idx+1] = c32[1];
            data[idx+2] = c32[2];
            data[idx+3] = 255;
        }
    }
    return imageData;
}
function blit(ctx, px32_data) {
    ctx.putImageData(px32_data, 0, 0);
}
function fill_color(ctx, px16) {
    const imageData = ctx.getImageData(0, 0, 396, 224);
    const data = imageData.data;
    let c32 = decode_rgb565(px16);
    for (let y = 0; y < 224; y++) {
        for (let x = 0; x < 396; x++) {
            let idx = (x + y * 396) << 2;
            data[idx+0] = c32[0];
            data[idx+1] = c32[1];
            data[idx+2] = c32[2];
            data[idx+3] = 255;
        }
    }
    return imageData;
}
let public_device, public_inpoint;
async function usb_init() {
    let device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x07CF }] });

    console.log(device);
    await device.open();
    await device.selectConfiguration(device.configurations[0].configurationValue);
    const interfaceNumber = device.configuration.interfaces[0].interfaceNumber;
    await device.claimInterface(interfaceNumber); 

    let sel_endpoint;
    for (const endpoint of device.configuration.interfaces[0].alternate.endpoints) {
        if (endpoint.direction == 'in') {
            sel_endpoint = endpoint;
            break;
        }
    }

    console.log(":D")
    public_device = device;
    public_inpoint = sel_endpoint;
    let on_frame = (result) => {
        let data = result.data;
        let i = 0;
        let version = data.getUint32(i, true); i += 4;
        let size = data.getUint32(i, true); i += 4;
        i += 4;  // FIFO size
        i += 16; // Application
        i += 16; // type
        if (size >= 177408) {
            // TODO: we should check app:type, but I'm lazy.
            let width = data.getUint32(i, true); i += 4;
            let height = data.getUint32(i, true); i += 4;
            let px_fmt = data.getUint32(i, true); i += 4;
            if (px_fmt != 0) throw new Error("!");
            let px16 = new Uint16Array(width * height);
            let subi = 0;
            const canvas = document.getElementById("calculator");
            const ctx = canvas.getContext("2d");
            while (i < data.byteLength)
            {
                px16[subi++] = data.getUint16(i, false);
                i += 2;
            }
            img = write_raw16(ctx, px16);
            blit(ctx, img);
        }
        device.transferIn(sel_endpoint.endpointNumber, 1<<20).then(on_frame);
    };
    device.transferIn(sel_endpoint.endpointNumber, 1<<20).then(on_frame);
    return device;
}
