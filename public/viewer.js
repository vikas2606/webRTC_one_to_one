const remoteVideo = document.getElementById('remoteVideo');
const ws = new WebSocket('ws://localhost:8080');
console.log(1)

let peerConnection;
const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};
console.log(2)

ws.onmessage = async (message) => {
    console.log(3)
    const data = JSON.parse(message.data); // Parse the message as JSON
    console.log(4,data)
    if (data.type === 'offer') {
        console.log(5)
        peerConnection = new RTCPeerConnection(configuration);
        console.log(6)
        peerConnection.ontrack = event => {
            console.log(7)
            remoteVideo.srcObject = event.streams[0];
            console.log(remoteVideo.srcObject)
        };
        console.log(8)
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
            } 
        };
        console.log(9)

        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        console.log(10)
        const answer = await peerConnection.createAnswer();
        console.log(11)
        await peerConnection.setLocalDescription(answer);
        console.log(12)
        ws.send(JSON.stringify({ type: 'answer', answer }));
        console.log(13)
    } else if (data.type === 'ice-candidate') {
        console.log(14)
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log(15)
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
};

