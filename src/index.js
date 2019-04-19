const multiaddr = require('multiaddr')
const PeerInfo = require('peer-info')
const P2PNode = require('./p2p')

function createPeer(callback) {
    // 新しく生成されたPeerIdを使って新しいPeerInfoオブジェクトを生成
    PeerInfo.create((err, peerInfo) => {
        if (err) {
            return callback(err)
        }

        // ランダムなポートでTCP接続を行うための待ち受け用のアドレスを追加
        const listenAddress = multiaddr('/ip4/127.0.0.1/tcp/0')
        peerInfo.multiaddrs.add(listenAddress)

        const peer = new P2PNode({peerInfo})
        peer.on('error', err => {
            console.error("libp2p error: ", err)
            throw err
        })

        callback(null, peer)
    })
}

function handleStart(peer) {
    const addresses = peer.peerInfo.multiaddrs.toArray()
    console.log("### peer started. listening on addresses: ")
    addresses.forEach(addr => console.log(addr.toString()))
}

createPeer((err, peer) => {
    if (err) {
        throw err
    }

    peer.start(err => {
        if (err) {
            throw err
        }

        handleStart(peer)
    })
})
