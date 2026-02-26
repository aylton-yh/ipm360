export async function PostRequest(url, content) {
    const Options = {
        // header: "application/json",
        body: content,
        method: "post"
    }
    const resquest = await fetch(url, Options)
    if (!resquest.ok) {
        console.log(`Falied Request ... \n Error: ${resquest.statusText}`);


    }
    else {
        const returns_request = await resquest.json()
        return returns_request;

    }

}
export async function GetRequest(url) {

    const resquest = await fetch(url)
    if (!resquest.ok) {
        console.log(`Falied Request ... \n Error: ${resquest.statusText}`);


    }
    else {
        const returns_request = await resquest.json()
        return returns_request;

    }

}
export async function PutRequest(url, content) {
    const Options = {
        headers: { "Content-Type": "application/json" },

        body: content,
        method: "put"
    }
    const resquest = await fetch(url, Options)
    if (!resquest.ok) {
        console.log(`Falied Request ... \n Error: ${resquest.statusText}`);


    }
    else {
        const returns_request = await resquest.json()
        return returns_request;

    }

}
export async function DeleteRequest(url,) {
    const Options = {
        headers: { "Content-Type": "application/json" }
        ,
        method: "delete"
    }
    const resquest = await fetch(url, Options)
    if (!resquest.ok) {
        console.log(`Falied Request ... \n Error: ${resquest.statusText}`);


    }
    else {
        const returns_request = await resquest.json()
        return returns_request;

    }

}