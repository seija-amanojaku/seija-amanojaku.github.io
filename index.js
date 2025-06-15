/* TODO: Spawn a random Liz */
function createLiz()
{
    let link = document.createElement('a');
    let liz = document.createElement('img');
    let x = Math.floor(Math.random() * 100);
    let y = Math.floor(Math.random() * 100);
    link.setAttribute("href", 'https://tobskep.com');
    link.setAttribute("style", `opacity: 0.2; position: absolute; top: ${x}vw; left: ${y}vw;`);
    liz.setAttribute("src", "https://doskel.net/images/6/67/Liz.png");
    liz.setAttribute("style", "width: 2vw; height: 2vw;");
    link.appendChild(liz);

    document.getElementsByTagName("html")[0].appendChild(link);

    return link;
}

createLiz();
