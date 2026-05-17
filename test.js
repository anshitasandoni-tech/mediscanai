const test = async () => {
    const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Hello there!", history: [] })
    });
    console.log(res.status);
    const data = await res.json();
    console.log(data);
};
test();
