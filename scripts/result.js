(function () {
    const Result = {
        init () {
            const url = new URL(location.href);
            const score = url.searchParams.get('score');
            const total = url.searchParams.get('total');
            document.getElementById('result-score').innerText = `${score}/${total}`;

        },
    }

    Result.init()
})();
