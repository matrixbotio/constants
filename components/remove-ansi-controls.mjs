const reg = /\u001b\[\d{1,3}(;\d{1,2})?(;\d{1,2})?[mGK]/g;

export default text => {
    return text.replace(reg, '');
}
