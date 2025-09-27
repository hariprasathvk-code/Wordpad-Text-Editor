    function formatdoc(cmd, value=null) {
        if(value) {
            document.execCommand(cmd, false, value);
        } else {
            document.execCommand(cmd);
        }
    }

function addLink() {
	const url = prompt('Insert url');
	formatDoc('createLink', url);
}

