from neo4j import GraphDatabase

URI = "neo4j+ssc://57e2ff7c.databases.neo4j.io"
USER = "57e2ff7c"
PASSWORD = "L1B6NKjfQws9TplUo9rtGTnFNG-Lzsv57BMwtlKd_5k"
DATABASE = "57e2ff7c"

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

try:
    driver.verify_connectivity()
    print("Connection successful!")

    records, summary, keys = driver.execute_query(
        "MATCH (n) RETURN count(n) AS total",
        database_=DATABASE,
    )
    print("Total nodes:", records[0]["total"])

except Exception as e:
    print("Connection failed:")
    print(type(e).__name__)
    print(e)

finally:
    driver.close()