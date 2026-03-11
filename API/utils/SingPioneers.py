import pandas as pd
from pandas import json_normalize 
import neo4j
from neo4j import GraphDatabase
import json
import re
import numpy as np



# Specify URI and AUTH of Neo4j database to access

# Alternatively: URI = "neo4j+s://ac3d3958.databases.neo4j.io"

URI = "neo4j+ssc://57e2ff7c.databases.neo4j.io"
AUTH = ("57e2ff7c", "L1B6NKjfQws9TplUo9rtGTnFNG-Lzsv57BMwtlKd_5k")
DATABASE = "57e2ff7c"


### Queries with no parameters

query_interethnic = """
	MATCH p=((Person1:Person)–[R*1..2]-(Person2:Person))
	WHERE Person1.race IS NOT NULL AND Person2.race IS NOT NULL AND 
	       Person1.race <> Person2.race AND 
		   none(x IN relationships(p) WHERE type(x) = 'type')  // type relation excluded from path
    RETURN p """

query_multi = """
    MATCH p=((Person1:Person)–[R1]-(Person2:Person)-[R2]-(Person1:Person))
	WHERE R1<>R2
    RETURN p """

# longer paths
query_multi2 = """
    MATCH p=((Person1:Person)–[R1]-()-[R]-(Person2:Person)-[R2]-(Person1:Person))
	WHERE R1<>R2 AND type(R)<>'type'
    RETURN p """

query_triad = """
	MATCH p=((Person1:Person)–[*1..2]-(Person2:Person)-[*1..2]-(Person3:Person)-[*1..2]-(Person1:Person))
	WHERE none(x IN relationships(p) WHERE type(x) = 'type')  // type relation excluded
    RETURN p """


### List in table

query_interethnic_table = """   
	MATCH p=((Person1:Person)–[R*1..2]-(Person2:Person))
	WHERE Person1.race IS NOT NULL AND Person2.race IS NOT NULL AND 
	      Person1.race <> Person2.race AND 
	      none(x IN relationships(p) WHERE type(x) = 'type')  // type relation excluded from path
    RETURN DISTINCT Person1.label as Person1, Person1.race, Person2.label as Person2, Person2.race, [x IN nodes(p) | x.label] as In_between_entities, [y IN relationships(p) | y.type] as Relation_links
	ORDER BY Person1.label, Person2.label """

query_triad_table = """ 
	MATCH p=((Person1:Person)–[*1..2]-(Person2:Person)-[*1..2]-(Person3:Person)-[*1..2]-(Person1:Person))
	WHERE Person2 <> Person3 AND none(x IN relationships(p) WHERE type(x) = 'type')  // type relation excluded
    RETURN DISTINCT Person1.label as Person1, Person2.label as Person2, Person3.label as Person3
	ORDER BY Person1.label, Person2.label, Person3.label """

	
### Queries with 1 parameter 
	
# Retrieve neighboring nodes for the specified node
query0 = """
    MATCH (Entity1 {id: $param1})-[R]-(Entity2)
    RETURN Entity1, R, Entity2 LIMIT 30 """

# Show specified Person and kinship links
# 1 link
query1a = """
	MATCH (Person1 {id: $param1})–[R:kinship]-(Person2)
    RETURN Person1, R, Person2 """

# Display 1 entity node
query1b = """
	MATCH (Entity {id: $param1})
    RETURN Entity """

# Display links that match a relation (given in param2)
query_relation = """
	MATCH (Entity1)–[R]-(Entity2)
	WHERE type(R) = $param2
    RETURN Entity1, R, Entity2 """

# Display links that match a list of relations (given in param2)
query_relationList = """
	MATCH (Entity1)–[R]-(Entity2)
	WHERE type(R) in $param2
    RETURN Entity1, R, Entity2 """

# Display links that match a relation type attribute (given in param2)
query_rel_type = """
	MATCH (Entity1)–[R {type: $param2}]-(Entity2)
    RETURN Entity1, R, Entity2 """

# Display links that match a relation type attribute (specify list of attribute values to match in param2)
query_rel_typeList = """
	MATCH (Entity1)–[R]-(Entity2)
	WHERE R.type in $param2
    RETURN Entity1, R, Entity2 """

# Display nodes (and neighbor nodes) that match the node LABEL (specify list of LABELs to match in param2)
query_node_labelList = """
	MATCH (Entity1)–[R]-(Entity2)
	WHERE R.type <> 'type' AND any(label IN labels(Entity1) WHERE label IN $param2)
    RETURN Entity1, R, Entity2 """

# Display nodes (and neighbor nodes) that match the node type attribute (specify list of types to match in param2)
query_node_typeList = """
	MATCH (Entity1)–[R]-(Entity2)
	WHERE Entity1.type in $param2 AND R.type <> 'type'
    RETURN Entity1, R, Entity2 """

	
### Queries with 2 parameters
	
# $param1 is an entity (usually person), param2 is a list of relations to match
query2a = """
	MATCH (Person1 {id: $param1})–[R]-(Person2)
	WHERE type(R) in $param2
    RETURN Person1, R, Person2 """

# Find shortest path between 2 entities
query_path = """
    MATCH (entityA {id: $param1}), (entityB {id: $param2}),
           path = shortestPath ( (entityA)-[*1..5]-(entityB)  )
    WHERE none(x IN relationships(path) WHERE type(x) = 'type')  // type relation excluded
    RETURN path """


# Keyword search in Nodes
searchNode = """
	CALL db.index.fulltext.queryNodes("SingPioneers_keyword", $param2) YIELD node  
    RETURN node ORDER BY node.label """

query_group_network = """
    MATCH (Person1 {id: $param1})-[R]-(Person2)
    WHERE type(R) in $param2
    RETURN Person1, R, Person2
"""
query_top_influential = """
    MATCH (p:Person)-[r]-()
    RETURN p.label AS person, count(r) AS degree
    ORDER BY degree DESC
    LIMIT 20
"""

query_top_influential_group = """
    MATCH (p:Person)-[r]-()
    WHERE type(r) in $param2
    RETURN p.label AS person, count(r) AS degree
    ORDER BY degree DESC
    LIMIT 20
"""

### Define functions

# function for processing a single node
def process_node (node): 
    # print('supertype: ', [X for X in node.labels] )  # Convert frozenset to list
    # print('element_id: ', node.element_id)  # element_id
    # print('keys: ', node.keys())   # Node properties
    # print('items: ', node.items())
    node_dict = dict(node.items())
    node_dict['supertype'] = [X for X in node.labels]  # Add supertype (labels) to dict
    node_dict['element_id'] = node.element_id.split(':')[2]  # Add element_id
    node_dict = convert_dates_to_str(node_dict)
    print('\nExtracted node dict: ', node_dict)
    return node_dict


# function for processing a single relation
def process_relation(relation):
    # print('supertype: ', relation.type)  # Node element_id    
    # print('element_id: ', relation.element_id)  # element_id
    # print('start_node: ', relation.start_node.element_id)  # start_node element_id    
    # print('end_node: ', relation.end_node.element_id)  # end_node element_id  
    relation_dict = dict(relation.items())
    relation_dict['supertype'] = relation.type  # Add supertype to dict
    relation_dict['element_id'] = relation.element_id.split(':')[2]  # Add element_id
    relation_dict['start_node'] = relation.start_node.element_id.split(':')[2]  
    relation_dict['end_node'] = relation.end_node.element_id.split(':')[2]  
    relation_dict = convert_dates_to_str(relation_dict)
    print('\nExtract relationdict: ', relation_dict)
    return relation_dict


def convert_dates_to_str(dictionary):
    for key, value in dictionary.items():
        if type(value) == neo4j.time.Date:
            dictionary[key] = value.__str__()
    return dictionary


# Main function to query the neo4j database
def retrieve (queryID, parameter1, parameter2):

    # Match queryID with query text
    match queryID:
        case 'interethnic': queryText = query_interethnic
        case 'multi': queryText = query_multi    
        case 'multi2': queryText = query_multi2    
        case 'triad': queryText = query_triad     
        case '0': queryText = query0    
        case '1a': queryText = query1a    
        case '1b': queryText = query1b    
        case 'relation': queryText = query_relation    
        case 'relationList': queryText = query_relationList
        case 'rel_type': queryText = query_rel_type    
        case 'rel_typeList': queryText = query_rel_typeList
        case 'node_labelList': queryText = query_node_labelList
        case 'node_typeList': queryText = query_node_typeList  
        case '2a': queryText = query2a
        case 'path': queryText = query_path    
        case 'searchKeyword': queryText = searchNode    
        case 'group_network': queryText = query_group_network      
        case 'top_influential': queryText = query_top_influential
        case 'top_influential_group': queryText = query_top_influential_group           
        case _: return { "help": "No such queryID "}
    # List for accumulating retrieval results
    results_list = []

# Neo4j Python driver Manual
    driver = GraphDatabase.driver(URI, auth=AUTH)
    session = driver.session(database=DATABASE)

    records, summary, keys = driver.execute_query(
        queryText,
        param1=parameter1,
        param2=parameter2,
        database_=DATABASE,
    )

    # Loop through records, and keys (fields)
    for record in records:
        print('========================================')
        print('type of record: ', type(record) )
        print('keys: ', keys)
        print('\nrecord: ', record)

        for key in keys:
            print('---------')
            print('key: ', key)
            print('\nrecord.values(key): ', record.values(key))
            print('\nrecord.values(key)[0]: ', record.values(key)[0])
            print('\ntype(record.values(key)[0]): ', type(record.values(key)[0]))

            if type(record.values(key)[0]) == neo4j.graph.Path :   # if this is a Path, then extract nodes and relations
                # print('Path nodes: ', record.values(key)[0].nodes)
                # print('Path relations: ', record.values(key)[0].relationships)
                for node in record.values(key)[0].nodes:
                    results_list.append( process_node(node) )              
                for relation in record.values(key)[0].relationships:
                    results_list.append( process_relation(relation) )
                
            elif type(record.values(key)[0]) == neo4j.graph.Node :   # if this is a Node
                results_list.append( process_node(record.values(key)[0]) )
                
            elif record.values(key)[0] is not None :   # record is a Relationship and not null
                results_list.append( process_relation(record.values(key)[0]) )

    session.close()
    driver.close()
    return json.dumps(results_list)



# Second version of retrieve function: to retrieve node/relation properties to display in a table
def retrieve_table(queryID, parameter1, parameter2):

    match queryID:
        case 'interethnic_table':
            queryText = query_interethnic_table
        case 'triad_table':
            queryText = query_triad_table
        case 'top_influential':
            queryText = query_top_influential
        case 'top_influential_group':
            queryText = query_top_influential_group
        case _:
            return { "help": "No such queryID "}

    # Create driver and session objects
    driver = GraphDatabase.driver(URI, auth=AUTH)
    session = driver.session(database=DATABASE)

    pandas_df = driver.execute_query(
        queryText,
        param1 = parameter1,
        param2 = parameter2,
        database_= DATABASE,
        result_transformer_=neo4j.Result.to_df
        # result_transformer_=lambda res: res.to_df(True)  $ flatten
    )

    session.close()
    driver.close()
    return pandas_df.to_json(orient='records')
