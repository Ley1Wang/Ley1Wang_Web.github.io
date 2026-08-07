import json
class MySqlHelper:
    def __init__(self):
        self.default_number = 0
        self.args_num = 0
        self.table=[]
    
    def CREATE(self, *columns):
        if len(self.table) != 0:
            raise ValueError("Table already exists")

        self.table.append(["SID"])

        for column in columns:
            self.table[0].append(column)

        self.args_num = len(columns)

    def INSERT(self, *args):
        if len(args) != self.args_num:
            raise ValueError("参数数量不匹配")

        self.table.append([self.default_number] + list(args))
        self.default_number += 1

    def DELETE(self, sid):
        for i in range(1, len(self.table)):
            if self.table[i][0] == sid:
                del self.table[i]
                return

        raise ValueError("SID not found")
    
    def UPDATE(self, new, sid, tag):
        if tag not in self.table[0]:
            raise ValueError("Column not found")
        col = self.table[0].index(tag) + 1
        for row in self.table[1:]:
            if row[0] == sid:
                row[col] = new
                return
        raise ValueError("SID not found")

    def SELECT(self, sid=None):
        if sid is None:
            return self.table
        for row in self.table[1:]:
            if row[0] == sid:
                return row

        raise ValueError("SID not found")
    
    def FIND(self, tag, value):
        if tag not in self.table[0]:
            raise ValueError("Column not found")
        col = self.table[0].index(tag) + 1
        result = []
        for row in self.table[1:]:
            if row[col] == value:
                result.append(row)
        return result
    

    def SAVE(self, filename):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(self.table, f, ensure_ascii=False, indent=4)

    def LOAD(self, filename):
        with open(filename, "r", encoding="utf-8") as f:
            self.table = json.load(f)