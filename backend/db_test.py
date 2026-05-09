import pymysql
try:
    conn = pymysql.connect(host="localhost", port=3306, user="root", password="mysql", database="margin_ai")
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM categories")
    count = cur.fetchone()[0]
    conn.close()
    print(f"DB OK - {count} categories")
except Exception as e:
    print(f"DB FAIL: {e}")
