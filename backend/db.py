from datetime import datetime, timezone
import uuid


# In-memory storage
_creatures = []


# ---------------------------------------------------------------------------
# Cursor (mimics MongoDB async cursor)
# ---------------------------------------------------------------------------

class MockCursor:
    def __init__(self, data):
        self._data = data
        self._skip_val  = 0
        self._limit_val = None
        self._index     = 0          # used by __anext__
        self._resolved  = False      # marks when slicing is done

    def sort(self, field, direction):
        if field == "created_at":
            self._data.sort(
                key=lambda x: x.get("created_at", datetime.min),
                reverse=(direction == -1)
            )
        return self

    def skip(self, count):
        self._skip_val = max(count, 0)
        return self

    def limit(self, count):
        self._limit_val = max(count, 0)
        return self

    def _resolve(self):
        """Apply skip/limit once, right before iteration starts."""
        if not self._resolved:
            data = self._data[self._skip_val:]
            if self._limit_val is not None:
                data = data[:self._limit_val]
            self._data     = data
            self._resolved = True

    # ✅ FIX: async iterator support — required for `async for doc in cursor`
    def __aiter__(self):
        self._resolve()
        self._index = 0
        return self

    async def __anext__(self):
        if self._index >= len(self._data):
            raise StopAsyncIteration
        item = self._data[self._index]
        self._index += 1
        return item

    async def to_list(self, length=None):
        self._resolve()
        if length is not None:
            return self._data[:length]
        return self._data


# ---------------------------------------------------------------------------
# Collection (Mock MongoDB)
# ---------------------------------------------------------------------------

class MockCollection:

    async def insert_one(self, doc):
        doc = dict(doc)
        doc.setdefault("creature_id", str(uuid.uuid4()))
        doc.setdefault("created_at", datetime.now(timezone.utc))
        _creatures.append(doc)
        return {"inserted_id": doc["creature_id"]}

    async def count_documents(self, query=None):
        return len(_creatures)

    def find(self, query=None, projection=None):
        data_copy = [dict(c) for c in _creatures]

        if projection:
            projected = []
            for d in data_copy:
                projected.append(_apply_projection(d, projection))
            data_copy = projected

        return MockCursor(data_copy)

    async def find_one(self, query, projection=None):
        cid = query.get("creature_id")

        for c in _creatures:
            if c.get("creature_id") == cid:
                d = dict(c)
                if projection:
                    return _apply_projection(d, projection)
                return d

        return None

    # ✅ FIX: delete_one added — required by DELETE /creatures/{id} in main.py
    async def delete_one(self, query):
        cid = query.get("creature_id")

        for i, c in enumerate(_creatures):
            if c.get("creature_id") == cid:
                _creatures.pop(i)
                return _DeleteResult(deleted_count=1)

        return _DeleteResult(deleted_count=0)

    async def create_index(self, *args, **kwargs):
        pass  # no-op for mock


# ---------------------------------------------------------------------------
# Projection helper  (fixes find_one include/exclude logic)
# ---------------------------------------------------------------------------

def _apply_projection(doc: dict, projection: dict) -> dict:
    """
    Mimics MongoDB projection:
    - {field: 1} → include only those fields (plus creature_id always)
    - {field: 0} → exclude those fields, keep the rest
    """
    include_fields = {k for k, v in projection.items() if v == 1}
    exclude_fields = {k for k, v in projection.items() if v == 0}

    if include_fields:
        # Include mode — always keep creature_id for lookups
        include_fields.add("creature_id")
        return {k: v for k, v in doc.items() if k in include_fields}

    if exclude_fields:
        # Exclude mode
        return {k: v for k, v in doc.items() if k not in exclude_fields}

    return doc


# ---------------------------------------------------------------------------
# Delete result wrapper
# ---------------------------------------------------------------------------

class _DeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count


# ---------------------------------------------------------------------------
# Mock DB instance
# ---------------------------------------------------------------------------

creatures_collection = MockCollection()


async def ensure_indexes():
    """No-op for mock DB."""
    pass