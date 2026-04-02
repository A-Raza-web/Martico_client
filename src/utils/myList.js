const MYLIST_API_BASE = "http://localhost:4000/api/mylist";
const MYLIST_IDS_KEY = "myListIds";

export const getOrCreateListUserId = () => {
  const loggedInUserId = localStorage.getItem("userId");
  if (loggedInUserId) return loggedInUserId;

  let guestUserId = localStorage.getItem("guestUserId");
  if (!guestUserId) {
    guestUserId = `guest_${Date.now()}`;
    localStorage.setItem("guestUserId", guestUserId);
  }

  return guestUserId;
};

export const getMyListIds = () => {
  try {
    const raw = localStorage.getItem(MYLIST_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id));
  } catch {
    return [];
  }
};

const saveMyListIds = (ids) => {
  const unique = Array.from(new Set(ids.map((id) => String(id))));
  localStorage.setItem(MYLIST_IDS_KEY, JSON.stringify(unique));
  return unique;
};

export const isInMyList = (productId) => {
  if (!productId) return false;
  return getMyListIds().includes(String(productId));
};

export const markInMyList = (productId) => {
  if (!productId) return [];
  const ids = getMyListIds();
  ids.push(String(productId));
  return saveMyListIds(ids);
};

export const unmarkInMyList = (productId) => {
  if (!productId) return [];
  const ids = getMyListIds().filter((id) => id !== String(productId));
  return saveMyListIds(ids);
};

export const syncMyListIds = (items) => {
  if (!Array.isArray(items)) return [];
  const ids = items
    .map((item) => item?.productId?._id || item?.productId || item?._id || item?.id)
    .filter(Boolean)
    .map((id) => String(id));
  return saveMyListIds(ids);
};

const buildMyListPayload = (product, userId) => {
  if (!product) {
    throw new Error("Product is required");
  }

  const productId = product._id || product.id || product.productId;
  if (!productId) {
    throw new Error("Product id is missing");
  }

  const price = product.newPrice ?? product.price ?? 0;
  const image =
    (product.images && product.images[0] && product.images[0].url) ||
    product.img ||
    product.image ||
    "";
  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name;

  const payload = {
    productId,
    userId,
    name: product.name || "Product",
    image,
    price,
    brand: product.brand || "",
    category
  };

  if (product.newPrice !== undefined) {
    payload.newPrice = product.newPrice;
  }

  return payload;
};

export const addToMyList = async (product) => {
  const userId = getOrCreateListUserId();
  const payload = buildMyListPayload(product, userId);

  const response = await fetch(`${MYLIST_API_BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Failed to add to my list.");
  }

  markInMyList(payload.productId);
  window.dispatchEvent(new Event("myListUpdated"));
  return result.data;
};

export const removeFromMyList = async (productIdOrItem) => {
  const productId =
    typeof productIdOrItem === "string"
      ? productIdOrItem
      : productIdOrItem?._id || productIdOrItem?.id || productIdOrItem?.productId;

  if (!productId) {
    throw new Error("Product id is missing");
  }

  const userId = getOrCreateListUserId();

  const listRes = await fetch(`${MYLIST_API_BASE}/user/${userId}`);
  const listJson = await listRes.json();

  if (!listRes.ok || !listJson?.success) {
    throw new Error(listJson?.message || "Failed to load your list.");
  }

  const items = Array.isArray(listJson.data) ? listJson.data : [];
  const match = items.find((item) => {
    const id = item?.productId?._id || item?.productId || item?._id || item?.id;
    return String(id) === String(productId);
  });

  if (!match) {
    unmarkInMyList(productId);
    window.dispatchEvent(new Event("myListUpdated"));
    return null;
  }

  const listId = match._id || match.id;
  if (!listId) {
    unmarkInMyList(productId);
    window.dispatchEvent(new Event("myListUpdated"));
    return null;
  }

  const delRes = await fetch(`${MYLIST_API_BASE}/delete/${listId}`, {
    method: "DELETE"
  });
  const delJson = await delRes.json();

  if (!delRes.ok || !delJson?.success) {
    throw new Error(delJson?.message || "Failed to remove from my list.");
  }

  unmarkInMyList(productId);
  window.dispatchEvent(new Event("myListUpdated"));
  return delJson.data;
};
