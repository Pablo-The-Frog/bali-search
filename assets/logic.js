document.getElementById("searchForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const query = document.getElementById("searchQuery").value.trim();
    if (query) {
        window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }
});
