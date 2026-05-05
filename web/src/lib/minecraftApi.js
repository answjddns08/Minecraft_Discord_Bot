const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");


/**
 * 
 * @param {string} path 
 * @returns {string} 완성된 URL
 */
function buildUrl(path) {
    if (!path.startsWith("/")) {
        return `${API_BASE}/${path}`;
    }

    return `${API_BASE}${path}`;
}

/**
 * Sends a request to the API endpoint
 * @param {string} path 
 * @param {Object} options 
 * @returns {Promise<any>} 
 */
async function request(path, options = {}) {
    const response = await fetch(buildUrl(path), {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        try {
            const errorData = await response.json();
            if (errorData?.error) {
                message = errorData.error;
            }
        } catch {
            const text = await response.text();
            if (text) {
                message = text;
            }
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export function getServerStatus() {
    return request("/api/server/status");
}

export function getServerPlayers() {
    return request("/api/server/players");
}

export function startServer() {
    return request("/api/server/start", { method: "POST" });
}

export function stopServer() {
    return request("/api/server/stop", { method: "POST" });
}

export function listWorlds() {
    return request("/api/worlds");
}

export function getWorldProperty() {
    return request("/api/worlds/property");
}

export function createWorld(payload) {
    return request("/api/worlds", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function selectWorld(name) {
    return request(`/api/worlds/${encodeURIComponent(name)}/select`, {
        method: "POST",
    });
}

export function deleteWorld(name) {
    return request(`/api/worlds/${encodeURIComponent(name)}`, {
        method: "DELETE",
    });
}

export function listTrashWorlds() {
    return request("/api/worlds/trash");
}

export function restoreWorld(name) {
    return request(`/api/worlds/${encodeURIComponent(name)}/restore`, {
        method: "POST",
    });
}