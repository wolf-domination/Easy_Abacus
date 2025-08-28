
from flask import Blueprint, request, jsonify
from dataclasses import dataclass, field

abacus_routes = Blueprint('abacus', __name__, url_prefix='/api/abacus')

@dataclass
class Box:
    W: int
    rows: dict = field(default_factory=dict)  # y -> count
    P: int = None

    @classmethod
    def init(cls, base: int):
        assert base >= 2
        W = base - 1
        return cls(W=W, rows={}, P=W)

    def _compact(self):
        for y in list(self.rows):
            if self.rows[y] <= 0:
                del self.rows[y]

    def _reset_divider(self):
        self.P = self.W

    def add(self, y: int, k: int):
        self._reset_divider()
        c = self.rows.get(y, 0)
        self.rows[y] = min(self.W, c + max(0, k))
        self._compact()

    def sub(self, y: int, k: int):
        self._reset_divider()
        c = self.rows.get(y, 0)
        self.rows[y] = max(0, c - max(0, k))
        self._compact()

    def _all_full(self):
        nonblank = [c for c in self.rows.values() if c > 0]
        return len(nonblank) > 0 and all(c == self.W for c in nonblank)

    def mul2(self, steps: int):
        steps = max(0, steps)
        for _ in range(steps):
            self._reset_divider()
            if self._all_full():
                self.rows = {y+1: c for y, c in self.rows.items() if c > 0}
            else:
                for y in list(self.rows):
                    c = self.rows[y]
                    if c > 0:
                        self.rows[y] = min(self.W, 2*c)
            self._compact()

    def _all_single_or_blank(self):
        nonblank = [c for c in self.rows.values() if c > 0]
        return len(nonblank) > 0 and all(c <= 1 for c in nonblank)

    def div2(self, steps: int):
        steps = max(0, steps)
        for _ in range(steps):
            if not self.rows:
                self._reset_divider()
                return
            if any(c >= 2 for c in self.rows.values()):
                self.P = max(1, (self.P if self.P is not None else self.W) // 2)
                for y in list(self.rows):
                    self.rows[y] = min(self.rows[y], self.P)
                self._compact()
            else:
                low = min(self.rows) if self.rows else 0
                if low == 0:
                    break
                self.rows = {y-1: c for y, c in self.rows.items() if c > 0}
                self._compact()

    def convert_base(self, base: int):
        assert base >= 2
        Wp = base - 1
        for y in list(self.rows):
            self.rows[y] = min(self.rows[y], Wp)
        self.W = Wp
        self.P = self.W
        self._compact()

    def to_json(self):
        return {
            "width": self.W,
            "divider": self.P,
            "rows": sorted([[int(y), int(c)] for y, c in self.rows.items()], key=lambda t: t[0])
        }

# Simple in-memory demo state (per-process)
BOX = Box.init(base=5)

@abacus_routes.get('/state')
def get_state():
    return jsonify(BOX.to_json())

@abacus_routes.post('/init')
def init_box():
    data = request.get_json(force=True, silent=True) or {}
    base = int(data.get('base', 5))
    global BOX
    BOX = Box.init(base=base)
    return jsonify(BOX.to_json())

@abacus_routes.post('/add')
def add():
    data = request.get_json(force=True, silent=True) or {}
    BOX.add(int(data.get('y', 0)), int(data.get('k', 1)))
    return jsonify(BOX.to_json())

@abacus_routes.post('/sub')
def sub():
    data = request.get_json(force=True, silent=True) or {}
    BOX.sub(int(data.get('y', 0)), int(data.get('k', 1)))
    return jsonify(BOX.to_json())

@abacus_routes.post('/mul2')
def mul2():
    data = request.get_json(force=True, silent=True) or {}
    BOX.mul2(int(data.get('steps', 1)))
    return jsonify(BOX.to_json())

@abacus_routes.post('/div2')
def div2():
    data = request.get_json(force=True, silent=True) or {}
    BOX.div2(int(data.get('steps', 1)))
    return jsonify(BOX.to_json())

@abacus_routes.post('/convert')
def convert():
    data = request.get_json(force=True, silent=True) or {}
    BOX.convert_base(int(data.get('base', 5)))
    return jsonify(BOX.to_json())
