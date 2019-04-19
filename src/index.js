const multiaddr = require('multiaddr')
const PeerInfo = require('peer-info')
const P2PNode = require('./p2p')
const process = require('process')
const PeerId = require('peer-id')
const Ping = require('libp2p-ping')

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
    addresses.forEach(addr => {
        console.log(addr.toString())
        pingRemotePeer(peer, addr)
    })
}

function pingRemotePeer(localPeer, addr) {
    if (process.argv.length < 3) {
        return console.log("### no remote peer address given, skipping ping")
    }

    const remoteAddr = multiaddr(process.argv[2])
    const peerId = PeerId.createFromB58String(addr.getPeerId())
    const remotePeerInfo = new PeerInfo(peerId)
    remotePeerInfo.multiaddrs.add(addr)

    console.log("### pinging remote peer at ", remoteAddr.toString())
    localPeer.ping(remotePeerInfo, (err, time) => {
        if (err) {
            return console.error("### error pinging: ", err)
        }

        console.log(`### pinged ${remoteAddr.toString()} in ${time}ms`)
    })
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
