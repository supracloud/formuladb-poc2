Ideas and inspiration for functionality:
 - spreadsheets
 - highly configurable ERP/CRM solutions
 - rules engines
 - BPMN, BPEL

Ideas and existing technologies that contributed to FormulaDB's architecture:
 - Event sourcing/CQRS
 - imperative vs functional vs declarative vs logic vs rules-engines vs visual (BPEL, BPMN, UML) programming
 - Spreadsheets formula engines, Recursion
 - Stream processing (Storm, Spark Streaming, Kafka Streams)
 - DDD aggregates with eventual consistency using events
 - Cassandra seamless massive scaling and constraints imposed on CQL to maintain predictable performance (e.g. partition key), tunable consistency, timeuuid, LWT
 - Kafka consumer groups fail-over and load-balancing, Kafka Streams State Stores
 - Kappa architecture (Jay Kreps)
 - Turning database inside out (Martin Kleppmann), duality table-stream
 - Persistent Data Structures, Clojure/Datomic (Rich Hickey), Immutable.js, Durable Persistent Data Structures
 - Polyglot Persistence (Martin Fowler)
 - Elasticsearch timestamped indexes, Kibana, curator
 - https://www.reactivemanifesto.org/, http://reactivex.io/, rxjs and marble testing
 - Key Value Stores, Document stores, Column-oriented Stores, Immutable data stores, CouchDB replication and conflicts
 - PouchDB and LevelUP ecosystem
 - Git, diff, merge, conflict
 - Database Cracking, auto-tuning databases
 - Distributed transactions and business transactions: 2PC, 3PC, Saga pattern
 - Consensus: Paxos, Raft
 - Kafka transactions
 - Graph Databases, graph traversal query languages (openCypher, Gremlin, GraphQL)
 - Generated UIs, Apache Isis
 - HATEOAS
 - Openstack, Kubernates, DC/OS: scaling an failover is being built into cloud tools, the DB can borrow functionality from these tools and not implement it internally
 - Jepsen tests, Netflix Chaos Monkey: testing for distributed databases/systems

Links:

http://milinda.pathirage.org/kappa-architecture.com/
https://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/
https://www.infoq.com/articles/microservices-aggregates-events-cqrs-part-1-richardson
https://www.infoq.com/presentations/saga-microservices
TODO
TODO
TODO
many more interesting links to add
