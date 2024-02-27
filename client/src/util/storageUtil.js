import * as ipfs from "ipfs-http-client";

async function ipfsClient() {
    const projectId = '2TAP7iJh1XWNJCA8w3sL4gEU7o2';
    const projectSecret = 'febeaa255d83e8c2e49c2c0eedc3b73a';
    const auth = 'Basic ' + window.btoa(projectId + ':' + projectSecret);
    return ipfs.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });
}

export async function storeFile(file) {
    const client = await ipfsClient();
    return 'https://ipfs.io/ipfs/' + (await client.add(file)).path;
}