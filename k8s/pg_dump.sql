--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5 (Debian 11.5-1.pgdg90+1)
-- Dumped by pg_dump version 12.0 (Debian 12.0-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

--
-- Name: f_10010; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_10010 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_10010 OWNER TO postgres;

--
-- Name: f_11552; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_11552 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_11552 OWNER TO postgres;

--
-- Name: f_12671; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_12671 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_12671 OWNER TO postgres;

--
-- Name: f_12849; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_12849 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_12849 OWNER TO postgres;

--
-- Name: f_4914; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_4914 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_4914 OWNER TO postgres;

--
-- Name: f_6844; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_6844 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_6844 OWNER TO postgres;

--
-- Name: f_808; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_808 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_808 OWNER TO postgres;

--
-- Name: f_9745; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_9745 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_9745 OWNER TO postgres;

--
-- Name: t_currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.t_currency (
    code character varying,
    _id character varying NOT NULL COLLATE pg_catalog."C"
);


ALTER TABLE public.t_currency OWNER TO postgres;

--
-- Name: t_dictionary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.t_dictionary (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    gb character varying,
    fr character varying,
    de character varying,
    it character varying,
    es character varying,
    pl character varying,
    el character varying,
    ro character varying,
    bg character varying,
    da character varying,
    sv character varying,
    no character varying,
    nl character varying
);


ALTER TABLE public.t_dictionary OWNER TO postgres;

--
-- Name: t_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.t_user (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    role character varying,
    password character varying,
    name character varying,
    details character varying
);


ALTER TABLE public.t_user OWNER TO postgres;

--
-- Name: tappcategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tappcategory (
    _id character varying NOT NULL COLLATE pg_catalog."C"
);


ALTER TABLE public.tappcategory OWNER TO postgres;

--
-- Name: tbooking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tbooking (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    guest character varying,
    room character varying,
    start_date character varying,
    end_date character varying,
    nb_adults numeric(12,5),
    nb_children numeric(12,5),
    days numeric(12,5),
    cost character varying,
    bookings_for_the_same_room character varying
);


ALTER TABLE public.tbooking OWNER TO postgres;

--
-- Name: tcontactrequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tcontactrequest (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    email character varying,
    comments character varying
);


ALTER TABLE public.tcontactrequest OWNER TO postgres;

--
-- Name: tinventoryorder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tinventoryorder (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    sales_agent character varying,
    creation_date character varying,
    order_item_table character varying
);


ALTER TABLE public.tinventoryorder OWNER TO postgres;

--
-- Name: tinventoryproduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tinventoryproduct (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    code character varying,
    barcode character varying,
    name character varying,
    description character varying,
    inventory_location character varying
);


ALTER TABLE public.tinventoryproduct OWNER TO postgres;

--
-- Name: tinventoryproductunit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tinventoryproductunit (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    code character varying,
    product_code character varying,
    product_name character varying,
    inventory_location character varying,
    serial1 character varying,
    serial2 character varying,
    serial3 character varying,
    serial4 character varying,
    serial5 character varying,
    serial6 character varying,
    serial7 character varying,
    install_date character varying,
    state character varying,
    nb_piston_cycles character varying,
    brita_counter character varying,
    washing_cycles character varying
);


ALTER TABLE public.tinventoryproductunit OWNER TO postgres;

--
-- Name: tinventoryreceipt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tinventoryreceipt (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    receipt_item_table character varying
);


ALTER TABLE public.tinventoryreceipt OWNER TO postgres;

--
-- Name: tlargesalesproduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tlargesalesproduct (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    product_id character varying,
    product_name character varying,
    large_sales_value numeric(12,5)
);


ALTER TABLE public.tlargesalesproduct OWNER TO postgres;

--
-- Name: tlargesalesreport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tlargesalesreport (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    client character varying,
    month character varying,
    large_sales_product_table character varying
);


ALTER TABLE public.tlargesalesreport OWNER TO postgres;

--
-- Name: tmetadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmetadata (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.tmetadata OWNER TO postgres;

--
-- Name: torderitem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.torderitem (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    product_id character varying,
    quantity numeric(12,5),
    error_quantity numeric(12,5),
    client_stock numeric(12,5),
    units character varying
);


ALTER TABLE public.torderitem OWNER TO postgres;

--
-- Name: tproductlocation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tproductlocation (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    product_id character varying,
    location_code character varying,
    category character varying,
    received_stock__ numeric(12,5),
    available_stock__ numeric(12,5),
    ordered_stock__ numeric(12,5),
    price numeric(12,5),
    currency__ character varying,
    minimal_stock numeric(12,5),
    moving_stock numeric(12,5),
    state character varying
);


ALTER TABLE public.tproductlocation OWNER TO postgres;

--
-- Name: treceiptitem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treceiptitem (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    product_id character varying,
    quantity numeric(12,5),
    price character varying,
    units character varying
);


ALTER TABLE public.treceiptitem OWNER TO postgres;

--
-- Name: troom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.troom (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    nb numeric(12,5),
    room_type character varying
);


ALTER TABLE public.troom OWNER TO postgres;

--
-- Name: troomtype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.troomtype (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    name character varying,
    description character varying,
    picture character varying,
    long_description character varying,
    price numeric(12,5),
    wifi character varying,
    parking character varying
);


ALTER TABLE public.troomtype OWNER TO postgres;

--
-- Name: tsampleapp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tsampleapp (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    name character varying,
    category character varying,
    category2 character varying,
    categories character varying,
    app_url character varying,
    short_description character varying,
    wish_list_count numeric(12,5),
    small_img character varying,
    long_img character varying
);


ALTER TABLE public.tsampleapp OWNER TO postgres;

--
-- Name: ttransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ttransaction (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.ttransaction OWNER TO postgres;

--
-- Name: twishlistrequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twishlistrequest (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    app character varying,
    email character varying,
    comments character varying
);


ALTER TABLE public.twishlistrequest OWNER TO postgres;

--
-- Data for Name: f_10010; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.f_10010 (_id, val) FROM stdin;
ProductLocation~~1__9a       100LargeSalesProduct~~1__1	\N
ProductLocation~~1__10       100LargeSalesProduct~~1__2	\N
ProductLocation~~1__11       100LargeSalesProduct~~1__3	\N
ProductLocation~~1__12       100LargeSalesProduct~~1__4	\N
\.


--
-- Data for Name: f_11552; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.f_11552 (_id, val) FROM stdin;
\.


--
-- Data for Name: f_12671; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.f_12671 (_id, val) FROM stdin;
\.


--
-- Data for Name: f_12849; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.f_12849 (_id, val) FROM stdin;
ProductLocation~~1__2aProductLocation~~1__2a	\N
ProductLocation~~1__3aProductLocation~~1__3a	\N
ProductLocation~~1__4aProductLocation~~1__4a	\N
ProductLocation~~1__5aProductLocation~~1__5a	\N
ProductLocation~~1__6aProductLocation~~1__6a	\N
ProductLocation~~1__7aProductLocation~~1__7a	\N
ProductLocation~~1__8aProductLocation~~1__8a	\N
ProductLocation~~1__9aProductLocation~~1__9a	\N
ProductLocation~~1__10ProductLocation~~1__10	\N
ProductLocation~~1__11ProductLocation~~1__11	\N
ProductLocation~~1__12ProductLocation~~1__12	\N
ProductLocation~~1__13ProductLocation~~1__13	\N
ProductLocation~~1__14ProductLocation~~1__14	\N
ProductLocation~~1__15ProductLocation~~1__15	\N
ProductLocation~~1__16ProductLocation~~1__16	\N
ProductLocation~~1__17ProductLocation~~1__17	\N
ProductLocation~~1__18ProductLocation~~1__18	\N
ProductLocation~~1__19ProductLocation~~1__19	\N
ProductLocation~~1__20ProductLocation~~1__20	\N
ProductLocation~~1__21ProductLocation~~1__21	\N
ProductLocation~~1__22ProductLocation~~1__22	\N
ProductLocation~~1__23ProductLocation~~1__23	\N
ProductLocation~~1__24ProductLocation~~1__24	\N
ProductLocation~~1__25ProductLocation~~1__25	\N
\.


--
-- Data for Name: f_4914; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.f_4914 (_id, val) FROM stdin;
\.


--
-- Data for Name: f_6844; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.f_6844 (_id, val) FROM stdin;
\.


--
-- Data for Name: f_808; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.f_808 (_id, val) FROM stdin;
SampleApp~~010 Basic InventorySampleApp~~010 Basic Inventory	\N
SampleApp~~020 Hotel BookingSampleApp~~020 Hotel Booking	\N
SampleApp~~040 Service ManagementSampleApp~~040 Service Management	\N
SampleApp~~050 Reporting & Business InteligenceSampleApp~~050 Reporting & Business Inteligence	\N
SampleApp~~060 Expenses & budgetsSampleApp~~060 Expenses & budgets	\N
SampleApp~~070 BlogSampleApp~~070 Blog	\N
SampleApp~~080 Photography servicesSampleApp~~080 Photography services	\N
SampleApp~~090 Design services SampleApp~~090 Design services 	\N
SampleApp~~100 Wellness servicesSampleApp~~100 Wellness services	\N
SampleApp~~110 Health clinicSampleApp~~110 Health clinic	\N
SampleApp~~120 Dental servicesSampleApp~~120 Dental services	\N
SampleApp~~130 Medical DoctorSampleApp~~130 Medical Doctor	\N
SampleApp~~140 Book PublishersSampleApp~~140 Book Publishers	\N
SampleApp~~150 SEO toolsSampleApp~~150 SEO tools	\N
SampleApp~~160 Advertising&Media ServicesSampleApp~~160 Advertising&Media Services	\N
SampleApp~~170 Digital Creative AgencySampleApp~~170 Digital Creative Agency	\N
\.


--
-- Data for Name: f_9745; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.f_9745 (_id, val) FROM stdin;
ProductLocation~~1__2aProductLocation~~1__2a	\N
ProductLocation~~1__3aProductLocation~~1__3a	\N
ProductLocation~~1__4aProductLocation~~1__4a	\N
ProductLocation~~1__5aProductLocation~~1__5a	\N
ProductLocation~~1__6aProductLocation~~1__6a	\N
ProductLocation~~1__7aProductLocation~~1__7a	\N
ProductLocation~~1__8aProductLocation~~1__8a	\N
ProductLocation~~1__9aProductLocation~~1__9a	\N
ProductLocation~~1__10ProductLocation~~1__10	\N
ProductLocation~~1__11ProductLocation~~1__11	\N
ProductLocation~~1__12ProductLocation~~1__12	\N
ProductLocation~~1__13ProductLocation~~1__13	\N
ProductLocation~~1__14ProductLocation~~1__14	\N
ProductLocation~~1__15ProductLocation~~1__15	\N
ProductLocation~~1__16ProductLocation~~1__16	\N
ProductLocation~~1__17ProductLocation~~1__17	\N
ProductLocation~~1__18ProductLocation~~1__18	\N
ProductLocation~~1__19ProductLocation~~1__19	\N
ProductLocation~~1__20ProductLocation~~1__20	\N
ProductLocation~~1__21ProductLocation~~1__21	\N
ProductLocation~~1__22ProductLocation~~1__22	\N
ProductLocation~~1__23ProductLocation~~1__23	\N
ProductLocation~~1__24ProductLocation~~1__24	\N
ProductLocation~~1__25ProductLocation~~1__25	\N
\.


--
-- Data for Name: t_currency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.t_currency (code, _id) FROM stdin;
RON	$Currency~~1
EUR	$Currency~~2
USD	$Currency~~3
\.


--
-- Data for Name: t_dictionary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.t_dictionary (_id, gb, fr, de, it, es, pl, el, ro, bg, da, sv, no, nl) FROM stdin;
\.


--
-- Data for Name: t_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.t_user (_id, role, password, name, details) FROM stdin;
$User~~Fredrick51	ADMIN	c9d9b8cab32214716ee1b44b3aae2502	Fredrick Lehner	International Operations Liaison
$User~~1	USER	c9d9b8cab32214716ee1b44b3aae2502	Rhianna Johns	Investor Branding Administrator
$User~~2	USER	c9d9b8cab32214716ee1b44b3aae2502	Monserrat Simonis	Dynamic Integration Analyst
$User~~3	USER	c9d9b8cab32214716ee1b44b3aae2502	Vergie Stracke Sr.	Dynamic Markets Architect
$User~~4	USER	c9d9b8cab32214716ee1b44b3aae2502	Keyon Wolf	District Infrastructure Planner
$User~~5	USER	c9d9b8cab32214716ee1b44b3aae2502	Jerad Buckridge	International Intranet Consultant
$User~~6	USER	c9d9b8cab32214716ee1b44b3aae2502	Ottis Conn	Future Program Executive
$User~~7	USER	c9d9b8cab32214716ee1b44b3aae2502	Hobart MacGyver	Regional Interactions Orchestrator
$User~~8	USER	c9d9b8cab32214716ee1b44b3aae2502	Brandon Ondricka Jr.	Legacy Metrics Planner
$User~~9	USER	c9d9b8cab32214716ee1b44b3aae2502	Bonita Collins	Central Identity Analyst
$User~~10	USER	c9d9b8cab32214716ee1b44b3aae2502	Lonie Wiza	Customer Division Coordinator
\.


--
-- Data for Name: tappcategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tappcategory (_id) FROM stdin;
\.


--
-- Data for Name: tbooking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tbooking (_id, guest, room, start_date, end_date, nb_adults, nb_children, days, cost, bookings_for_the_same_room) FROM stdin;
Booking~~1__1	$User~~4	Room~~DoubleDeluxe1	2019-04-03	2019-04-08	2.00000	2.00000	6.00000	600	FILTER(Booking, @[booking_item_id] == booking_item_id)
Booking~~1__2	$User~~1	Room~~DoubleDeluxe1	2019-04-19	2019-04-24	2.00000	2.00000	6.00000	600	FILTER(Booking, @[booking_item_id] == booking_item_id)
Booking~~2__3	$User~~2	Room~~SigleDeluxe1	2019-04-10	2019-04-15	1.00000	0.00000	6.00000	600	FILTER(Booking, @[booking_item_id] == booking_item_id)
Booking~~2__4	$User~~3	Room~~SigleDeluxe1	2019-04-24	2019-04-28	1.00000	0.00000	5.00000	500	FILTER(Booking, @[booking_item_id] == booking_item_id)
Booking~~3__5	$User~~5	Room~~Honeymoon1	2019-04-06	2019-04-09	2.00000	0.00000	4.00000	400	FILTER(Booking, @[booking_item_id] == booking_item_id)
Booking~~3__6	$User~~7	Room~~Honeymoon1	2019-04-26	2019-04-30	2.00000	0.00000	5.00000	500	FILTER(Booking, @[booking_item_id] == booking_item_id)
\.


--
-- Data for Name: tcontactrequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tcontactrequest (_id, email, comments) FROM stdin;
\.


--
-- Data for Name: tinventoryorder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tinventoryorder (_id, sales_agent, creation_date, order_item_table) FROM stdin;
InventoryOrder~~1	John Doe	2018-09-27	\N
\.


--
-- Data for Name: tinventoryproduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tinventoryproduct (_id, code, barcode, name, description, inventory_location) FROM stdin;
InventoryProduct~~1	p1	40063813339310	Product1	Product 1 Description lorem ipsum bla bla	\N
InventoryProduct~~1a	p1a	4006381333931	Practical Concrete Car	Quas reiciendis non et eveniet iure aut.	\N
InventoryProduct~~2a	p2a	4006381333932	Gorgeous Cotton TablePage	Libero voluptatem aut.	\N
InventoryProduct~~3a	p3a	4006381333933	Fantastic Frozen Pizza	Aut culpa iusto harum ad.	\N
InventoryProduct~~4a	p4a	4006381333934	Awesome Granite Pants	Assumenda nostrum quaerat fugit nesciunt libero aliquam.	\N
InventoryProduct~~5a	p5a	4006381333935	Awesome Steel Car	Architecto cum maiores velit voluptatibus.	\N
InventoryProduct~~6a	p6a	4006381333936	Gorgeous Soft Shirt	Omnis omnis exercitationem eos nesciunt.	\N
InventoryProduct~~7a	p7a	4006381333937	Ergonomic Wooden Salad	Ea maxime minima nostrum porro recusandae repellendus.	\N
InventoryProduct~~8a	p8a	4006381333938	Intelligent Fresh Tuna	Architecto sed vitae molestias et minus nemorem provident.	\N
InventoryProduct~~9a	p9a	4006381333939	Handmade Frozen Hat	Fugit recusandae est illum voluptas officiis.	\N
InventoryProduct~~10	p10	40063813339310	Incredible Rubber Computer	Reiciendis libero aut omnis ipsam veniam quas reiciendis.	\N
InventoryProduct~~11	p11	40063813339311	Small Fresh Pants	Temporibus quia perspiciatis sint exercitationem minima.	\N
InventoryProduct~~12	p12	40063813339312	Unbranded Rubber Pizza	Eveniet itaque consequatur nostrum molestiae distinctio non quod.	\N
InventoryProduct~~13	p13	40063813339313	Sleek Soft Mouse	Voluptas quia aut iusto deleniti.	\N
InventoryProduct~~14	p14	40063813339314	Licensed Cotton Chicken	Qui temporibus facere rem ut ullam excepturi non.	\N
InventoryProduct~~15	p15	40063813339315	Tasty Steel Fish	Nemo vitae quam doloremque similique cum aspernatur.	\N
InventoryProduct~~16	p16	40063813339316	Handcrafted Frozen Car	Commodi numquam quisquam praesentium ducimus et dignissimos ut.	\N
InventoryProduct~~17	p17	40063813339317	Sleek Cotton Car	Debitis qui eligendi eligendi sequi ipsam ea aut impedit.	\N
InventoryProduct~~18	p18	40063813339318	Rustic Plastic Ball	Velit et consequuntur laboriosam asperiores sit illo neque dolores.	\N
InventoryProduct~~19	p19	40063813339319	Licensed Frozen Towels	Quo quae eum sed et nisi expedita architecto omnis iusto.	\N
InventoryProduct~~20	p20	40063813339320	Ergonomic Granite Car	Animi at earum amet.	\N
InventoryProduct~~21	p21	40063813339321	Handmade Granite Pants	Molestias pariatur culpa voluptate sint et facilis sed.	\N
InventoryProduct~~22	p22	40063813339322	Licensed Wooden Keyboard	Aliquid ducimus est ut non vitae.	\N
InventoryProduct~~23	p23	40063813339323	Fantastic Metal Shirt	Sed dolorum pariatur accusamus.	\N
InventoryProduct~~24	p24	40063813339324	Refined Frozen TablePage	Cupiditate aperiam aut nisi laudantium.	\N
InventoryProduct~~25	p25	40063813339325	Tasty Cotton Chips	Aut hic rerum explicabo ut illo ipsumtempora quisquam pariatur.	\N
\.


--
-- Data for Name: tinventoryproductunit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tinventoryproductunit (_id, code, product_code, product_name, inventory_location, serial1, serial2, serial3, serial4, serial5, serial6, serial7, install_date, state, nb_piston_cycles, brita_counter, washing_cycles) FROM stdin;
InventoryProductUnit~~1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tinventoryreceipt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tinventoryreceipt (_id, receipt_item_table) FROM stdin;
InventoryReceipt~~1	\N
InventoryReceipt~~2	\N
\.


--
-- Data for Name: tlargesalesproduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tlargesalesproduct (_id, product_id, product_name, large_sales_value) FROM stdin;
LargeSalesProduct~~1__1	ProductLocation~~1__9a	Handmade Frozen Hat	0.00000
LargeSalesProduct~~1__2	ProductLocation~~1__10	Incredible Rubber Computer	0.00000
LargeSalesProduct~~1__3	ProductLocation~~1__11	Small Fresh Pants	0.00000
LargeSalesProduct~~1__4	ProductLocation~~1__12	Unbranded Rubber Pizza	0.00000
\.


--
-- Data for Name: tlargesalesreport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tlargesalesreport (_id, client, month, large_sales_product_table) FROM stdin;
LargeSalesReport~~1	John Doe	2018-09-01	\N
\.


--
-- Data for Name: tmetadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tmetadata (_id, val) FROM stdin;
FRMDB_SCHEMA~~formuladb-examples--basic-inventory	{"_id":"FRMDB_SCHEMA~~formuladb-examples--basic-inventory","entities":{"InventoryOrder":{"_id":"InventoryOrder","stateGraph":{"nodes":["PENDING","COMPLETE","APPROVED","PROCESSED","CANCELLED"],"transitions":[{"source":"PENDING","target":"COMPLETE"},{"source":"COMPLETE","target":"APPROVED"},{"source":"APPROVED","target":"PROCESSED"},{"source":"PENDING","target":"CANCELLED"},{"source":"COMPLETE","target":"CANCELLED"},{"source":"APPROVED","target":"CANCELLED"}]},"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"sales_agent":{"name":"sales_agent","propType_":"STRING","allowNull":false},"creation_date":{"name":"creation_date","propType_":"DATETIME","allowNull":false},"order_item_table":{"name":"order_item_table","propType_":"CHILD_TABLE","referencedEntityName":"OrderItem","props":{},"isLargeTable":true}},"isEditable":true},"OrderItem":{"_id":"OrderItem","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"product_id":{"name":"product_id","propType_":"REFERENCE_TO","referencedEntityName":"ProductLocation","referencedPropertyName":"_id"},"quantity":{"name":"quantity","propType_":"NUMBER","allowNull":false},"error_quantity":{"name":"error_quantity","propType_":"NUMBER"},"client_stock":{"name":"client_stock","propType_":"NUMBER"},"units":{"name":"units","propType_":"CHILD_TABLE","referencedEntityName":"InventoryProductUnit"}},"autoCorrectionsOnValidationFailed":{"ProductLocation!positiveStock":[{"targetPropertyName":"quantity","autoCorrectExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"NumberLiteral","startIndex":4,"endIndex":5,"origExpr":"0","value":0,"raw":"0"},{"type":"BinaryExpression","startIndex":7,"endIndex":41,"origExpr":"quantity + $ROW$.available_stock__","operator":"+","left":{"type":"Identifier","startIndex":7,"endIndex":15,"origExpr":"quantity","name":"quantity"},"right":{"type":"MemberExpression","startIndex":18,"computed":false,"object":{"type":"Identifier","startIndex":18,"endIndex":23,"origExpr":"$ROW$","name":"$ROW$"},"property":{"type":"Identifier","startIndex":24,"endIndex":41,"origExpr":"available_stock__","name":"available_stock__"},"endIndex":41,"origExpr":"$ROW$.available_stock__"}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":3,"origExpr":"MAX","name":"MAX"},"endIndex":42,"origExpr":"MAX(0, quantity + $ROW$.available_stock__)"}},{"targetPropertyName":"error_quantity","autoCorrectExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"BinaryExpression","startIndex":4,"endIndex":29,"origExpr":"$OLD$.quantity - quantity","operator":"-","left":{"type":"MemberExpression","startIndex":4,"computed":false,"object":{"type":"Identifier","startIndex":4,"endIndex":9,"origExpr":"$OLD$","name":"$OLD$"},"property":{"type":"Identifier","startIndex":10,"endIndex":18,"origExpr":"quantity","name":"quantity"},"endIndex":18,"origExpr":"$OLD$.quantity"},"right":{"type":"Identifier","startIndex":21,"endIndex":29,"origExpr":"quantity","name":"quantity"}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":3,"origExpr":"ABS","name":"ABS"},"endIndex":30,"origExpr":"ABS($OLD$.quantity - quantity)"}}]},"isEditable":true},"InventoryReceipt":{"_id":"InventoryReceipt","isEditable":true,"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"receipt_item_table":{"name":"receipt_item_table","propType_":"CHILD_TABLE","referencedEntityName":"ReceiptItem","props":{},"isLargeTable":true}}},"ReceiptItem":{"_id":"ReceiptItem","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"product_id":{"name":"product_id","propType_":"REFERENCE_TO","referencedEntityName":"ProductLocation","referencedPropertyName":"_id"},"quantity":{"name":"quantity","propType_":"NUMBER","allowNull":false},"price":{"name":"price","propType_":"REFERENCE_TO","referencedEntityName":"ProductLocation","referencedPropertyName":"price"},"units":{"name":"units","propType_":"CHILD_TABLE","referencedEntityName":"InventoryProductUnit"}},"isEditable":true},"InventoryProduct":{"_id":"InventoryProduct","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"code":{"name":"code","propType_":"STRING","allowNull":false},"barcode":{"name":"barcode","propType_":"STRING"},"name":{"name":"name","propType_":"STRING","allowNull":false},"description":{"name":"description","propType_":"STRING"},"inventory_location":{"name":"inventory_location","propType_":"CHILD_TABLE","referencedEntityName":"ProductLocation","props":{}}},"isEditable":true},"ProductLocation":{"_id":"ProductLocation","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"product_id":{"name":"product_id","propType_":"STRING","allowNull":false,"defaultValue":"DEFAULT-location"},"location_code":{"name":"location_code","propType_":"STRING","allowNull":false,"defaultValue":"DEFAULT-location"},"category":{"name":"category","propType_":"STRING","allowNull":false},"received_stock__":{"name":"received_stock__","propType_":"FORMULA","formula":"SUMIF(ReceiptItem.quantity, product_id == @[_id])","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"MemberExpression","startIndex":6,"computed":false,"object":{"type":"Identifier","startIndex":6,"endIndex":17,"origExpr":"ReceiptItem","name":"ReceiptItem"},"property":{"type":"Identifier","startIndex":18,"endIndex":26,"origExpr":"quantity","name":"quantity","belongsTo":"ReceiptItem"},"endIndex":26,"origExpr":"ReceiptItem.quantity"},{"type":"BinaryExpression","startIndex":28,"endIndex":48,"origExpr":"product_id == @[_id]","operator":"==","left":{"type":"Identifier","startIndex":28,"endIndex":38,"origExpr":"product_id","name":"product_id","belongsTo":"ReceiptItem"},"right":{"type":"MemberExpression","startIndex":42,"computed":true,"object":{"type":"Literal","startIndex":42,"endIndex":43,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":44,"endIndex":47,"origExpr":"_id","name":"_id","belongsTo":"ReceiptItem"},"endIndex":48,"origExpr":"@[_id]"}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"SUMIF","name":"SUMIF"},"endIndex":49,"origExpr":"SUMIF(ReceiptItem.quantity, product_id == @[_id])"},"finalExpression":{"type":"MemberExpression","startIndex":0,"computed":true,"object":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"$TRG$","name":"$TRG$"},"property":{"type":"StringLiteral","startIndex":6,"endIndex":75,"origExpr":"'vaggs-ReceiptItem-SUMIF(ReceiptItem.quantity, product_id == @[_id])'","value":"vaggs-ReceiptItem-SUMIF(ReceiptItem.quantity, product_id == @[_id])","raw":"'vaggs-ReceiptItem-SUMIF(ReceiptItem.quantity, product_id == @[_id])'"},"endIndex":76,"origExpr":"$TRG$['vaggs-ReceiptItem-SUMIF(ReceiptItem.quantity, product_id == @[_id])']"},"targetEntityName":"ProductLocation","targetPropertyName":"received_stock__","triggers":[{"type_":"MapReduceTriggerN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"MemberExpression","startIndex":6,"computed":false,"object":{"type":"Identifier","startIndex":6,"endIndex":17,"origExpr":"ReceiptItem","name":"ReceiptItem"},"property":{"type":"Identifier","startIndex":18,"endIndex":26,"origExpr":"quantity","name":"quantity","belongsTo":"ReceiptItem"},"endIndex":26,"origExpr":"ReceiptItem.quantity"},{"type":"BinaryExpression","startIndex":28,"endIndex":48,"origExpr":"product_id == @[_id]","operator":"==","left":{"type":"Identifier","startIndex":28,"endIndex":38,"origExpr":"product_id","name":"product_id","belongsTo":"ReceiptItem"},"right":{"type":"MemberExpression","startIndex":42,"computed":true,"object":{"type":"Literal","startIndex":42,"endIndex":43,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":44,"endIndex":47,"origExpr":"_id","name":"_id","belongsTo":"ReceiptItem"},"endIndex":48,"origExpr":"@[_id]"}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"SUMIF","name":"SUMIF"},"endIndex":49,"origExpr":"SUMIF(ReceiptItem.quantity, product_id == @[_id])"},"mapreduceAggsOfManyObservablesQueryableFromOneObs":{"aggsViewName":"vaggs-ReceiptItem-SUMIF(ReceiptItem.quantity, product_id == @[_id])","map":{"entityName":"ReceiptItem","keyExpr":[{"type":"Identifier","startIndex":28,"endIndex":38,"origExpr":"product_id","name":"product_id","belongsTo":"ReceiptItem"}],"valueExpr":{"type":"Identifier","startIndex":0,"endIndex":8,"origExpr":"quantity","name":"quantity"},"query":{"startkeyExpr":[{"type":"MemberExpression","startIndex":42,"computed":true,"object":{"type":"Literal","startIndex":42,"endIndex":43,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":44,"endIndex":47,"origExpr":"_id","name":"_id","belongsTo":"ReceiptItem"},"endIndex":48,"origExpr":"@[_id]"}],"endkeyExpr":[{"type":"MemberExpression","startIndex":42,"computed":true,"object":{"type":"Literal","startIndex":42,"endIndex":43,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":44,"endIndex":47,"origExpr":"_id","name":"_id","belongsTo":"ReceiptItem"},"endIndex":48,"origExpr":"@[_id]"}],"inclusive_start":true,"inclusive_end":true}},"reduceFun":{"name":"SumReduceFunN"}},"mapObserversImpactedByOneObservable":{"obsViewName":"vobs-ProductLocation-SUMIF(ReceiptItem.quantity, product_id == @[_id])","entityName":"ProductLocation","keyExpr":[{"type":"MemberExpression","startIndex":42,"computed":true,"object":{"type":"Literal","startIndex":42,"endIndex":43,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":44,"endIndex":47,"origExpr":"_id","name":"_id","belongsTo":"ReceiptItem"},"endIndex":48,"origExpr":"@[_id]"}],"query":{"startkeyExpr":[{"type":"Identifier","startIndex":28,"endIndex":38,"origExpr":"product_id","name":"product_id","belongsTo":"ReceiptItem"}],"endkeyExpr":[{"type":"Identifier","startIndex":28,"endIndex":38,"origExpr":"product_id","name":"product_id","belongsTo":"ReceiptItem"}],"inclusive_start":true,"inclusive_end":true},"valueExpr":{"type":"Identifier","startIndex":0,"endIndex":3,"origExpr":"_id","name":"_id"}}}]}},"available_stock__":{"name":"available_stock__","propType_":"FORMULA","formula":"received_stock__ - ordered_stock__","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"BinaryExpression","startIndex":0,"endIndex":34,"origExpr":"received_stock__ - ordered_stock__","operator":"-","left":{"type":"Identifier","startIndex":0,"endIndex":16,"origExpr":"received_stock__","name":"received_stock__"},"right":{"type":"Identifier","startIndex":19,"endIndex":34,"origExpr":"ordered_stock__","name":"ordered_stock__"}},"finalExpression":{"type":"BinaryExpression","startIndex":0,"endIndex":34,"origExpr":"received_stock__ - ordered_stock__","operator":"-","left":{"type":"Identifier","startIndex":0,"endIndex":16,"origExpr":"received_stock__","name":"received_stock__"},"right":{"type":"Identifier","startIndex":19,"endIndex":34,"origExpr":"ordered_stock__","name":"ordered_stock__"}},"targetEntityName":"ProductLocation","targetPropertyName":"available_stock__"}},"ordered_stock__":{"name":"ordered_stock__","propType_":"FORMULA","formula":"SUMIF(OrderItem.quantity, product_id == @[_id])","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"MemberExpression","startIndex":6,"computed":false,"object":{"type":"Identifier","startIndex":6,"endIndex":15,"origExpr":"OrderItem","name":"OrderItem"},"property":{"type":"Identifier","startIndex":16,"endIndex":24,"origExpr":"quantity","name":"quantity","belongsTo":"OrderItem"},"endIndex":24,"origExpr":"OrderItem.quantity"},{"type":"BinaryExpression","startIndex":26,"endIndex":46,"origExpr":"product_id == @[_id]","operator":"==","left":{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"right":{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":45,"origExpr":"_id","name":"_id","belongsTo":"OrderItem"},"endIndex":46,"origExpr":"@[_id]"}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"SUMIF","name":"SUMIF"},"endIndex":47,"origExpr":"SUMIF(OrderItem.quantity, product_id == @[_id])"},"finalExpression":{"type":"MemberExpression","startIndex":0,"computed":true,"object":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"$TRG$","name":"$TRG$"},"property":{"type":"StringLiteral","startIndex":6,"endIndex":71,"origExpr":"'vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[_id])'","value":"vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[_id])","raw":"'vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[_id])'"},"endIndex":72,"origExpr":"$TRG$['vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[_id])']"},"targetEntityName":"ProductLocation","targetPropertyName":"ordered_stock__","triggers":[{"type_":"MapReduceTriggerN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"MemberExpression","startIndex":6,"computed":false,"object":{"type":"Identifier","startIndex":6,"endIndex":15,"origExpr":"OrderItem","name":"OrderItem"},"property":{"type":"Identifier","startIndex":16,"endIndex":24,"origExpr":"quantity","name":"quantity","belongsTo":"OrderItem"},"endIndex":24,"origExpr":"OrderItem.quantity"},{"type":"BinaryExpression","startIndex":26,"endIndex":46,"origExpr":"product_id == @[_id]","operator":"==","left":{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"right":{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":45,"origExpr":"_id","name":"_id","belongsTo":"OrderItem"},"endIndex":46,"origExpr":"@[_id]"}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"SUMIF","name":"SUMIF"},"endIndex":47,"origExpr":"SUMIF(OrderItem.quantity, product_id == @[_id])"},"mapreduceAggsOfManyObservablesQueryableFromOneObs":{"aggsViewName":"vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[_id])","map":{"entityName":"OrderItem","keyExpr":[{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"}],"valueExpr":{"type":"Identifier","startIndex":0,"endIndex":8,"origExpr":"quantity","name":"quantity"},"query":{"startkeyExpr":[{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":45,"origExpr":"_id","name":"_id","belongsTo":"OrderItem"},"endIndex":46,"origExpr":"@[_id]"}],"endkeyExpr":[{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":45,"origExpr":"_id","name":"_id","belongsTo":"OrderItem"},"endIndex":46,"origExpr":"@[_id]"}],"inclusive_start":true,"inclusive_end":true}},"reduceFun":{"name":"SumReduceFunN"}},"mapObserversImpactedByOneObservable":{"obsViewName":"vobs-ProductLocation-SUMIF(OrderItem.quantity, product_id == @[_id])","entityName":"ProductLocation","keyExpr":[{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":45,"origExpr":"_id","name":"_id","belongsTo":"OrderItem"},"endIndex":46,"origExpr":"@[_id]"}],"query":{"startkeyExpr":[{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"}],"endkeyExpr":[{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"}],"inclusive_start":true,"inclusive_end":true},"valueExpr":{"type":"Identifier","startIndex":0,"endIndex":3,"origExpr":"_id","name":"_id"}}}]}},"price":{"name":"price","propType_":"NUMBER","allowNull":true},"currency":{"propType_":"REFERENCE_TO","referencedEntityName":"General_Currency","referencedPropertyName":"code","name":"currency__"},"minimal_stock":{"name":"minimal_stock","propType_":"NUMBER","allowNull":false},"moving_stock":{"name":"moving_stock","propType_":"NUMBER","allowNull":false},"state":{"name":"state","propType_":"STRING","allowNull":false}},"validations":{"positiveStock":{"conditionExpr":{"type":"BinaryExpression","startIndex":0,"endIndex":22,"origExpr":"available_stock__ >= 0","operator":">=","left":{"type":"Identifier","startIndex":0,"endIndex":17,"origExpr":"available_stock__","name":"available_stock__"},"right":{"type":"NumberLiteral","startIndex":21,"endIndex":22,"origExpr":"0","value":0,"raw":"0"}}}},"isEditable":true},"InventoryProductUnit":{"_id":"InventoryProductUnit","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"code":{"name":"code","propType_":"STRING","allowNull":false},"productCode":{"propType_":"REFERENCE_TO","name":"product_code","referencedEntityName":"InventoryProduct","referencedPropertyName":"code"},"product_name":{"propType_":"REFERENCE_TO","name":"product_name","referencedEntityName":"InventoryProduct","referencedPropertyName":"name"},"inventory_location":{"name":"inventory_location","propType_":"STRING","allowNull":false},"serial1":{"name":"serial1","propType_":"STRING"},"serial2":{"name":"serial2","propType_":"STRING"},"serial3":{"name":"serial3","propType_":"STRING"},"serial4":{"name":"serial4","propType_":"STRING"},"serial5":{"name":"serial5","propType_":"STRING"},"serial6":{"name":"serial6","propType_":"STRING"},"serial7":{"name":"serial7","propType_":"STRING"},"install_date":{"name":"install_date","propType_":"DATETIME"},"state":{"name":"state","propType_":"STRING","allowNull":false},"nb_piston_cycles":{"name":"nb_piston_cycles","propType_":"STRING"},"brita_counter":{"name":"brita_counter","propType_":"STRING"},"washing_cycles":{"name":"washing_cycles","propType_":"STRING"}},"isEditable":true},"LargeSalesReport":{"_id":"LargeSalesReport","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"client":{"name":"client","propType_":"STRING","allowNull":false},"month":{"name":"month","propType_":"DATETIME"},"large_sales_product_table":{"name":"large_sales_product_table","propType_":"CHILD_TABLE","referencedEntityName":"LargeSalesProduct","isLargeTable":true,"props":{}}},"isEditable":true},"LargeSalesProduct":{"_id":"LargeSalesProduct","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"product_id":{"name":"product_id","propType_":"STRING","allowNull":false},"product_name":{"name":"product_name","propType_":"STRING","allowNull":false},"large_sales_value":{"name":"large_sales_value","propType_":"FORMULA","formula":"SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"MemberExpression","startIndex":6,"computed":false,"object":{"type":"Identifier","startIndex":6,"endIndex":15,"origExpr":"OrderItem","name":"OrderItem"},"property":{"type":"Identifier","startIndex":16,"endIndex":24,"origExpr":"quantity","name":"quantity","belongsTo":"OrderItem"},"endIndex":24,"origExpr":"OrderItem.quantity"},{"type":"LogicalExpression","startIndex":26,"endIndex":71,"origExpr":"product_id == @[product_id] && quantity > 100","operator":"&&","left":{"type":"BinaryExpression","startIndex":26,"endIndex":56,"origExpr":"product_id == @[product_id] &","operator":"==","left":{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"right":{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":52,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"endIndex":53,"origExpr":"@[product_id]"}},"right":{"type":"BinaryExpression","startIndex":26,"endIndex":71,"origExpr":"product_id == @[product_id] && quantity > 100","operator":">","left":{"type":"Identifier","startIndex":57,"endIndex":65,"origExpr":"quantity","name":"quantity","belongsTo":"OrderItem"},"right":{"type":"NumberLiteral","startIndex":68,"endIndex":71,"origExpr":"100","value":100,"raw":"100"}}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"SUMIF","name":"SUMIF"},"endIndex":72,"origExpr":"SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)"},"finalExpression":{"type":"MemberExpression","startIndex":0,"computed":true,"object":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"$TRG$","name":"$TRG$"},"property":{"type":"StringLiteral","startIndex":6,"endIndex":96,"origExpr":"'vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)'","value":"vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)","raw":"'vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)'"},"endIndex":97,"origExpr":"$TRG$['vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)']"},"targetEntityName":"LargeSalesProduct","targetPropertyName":"large_sales_value","triggers":[{"type_":"MapReduceTriggerN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"MemberExpression","startIndex":6,"computed":false,"object":{"type":"Identifier","startIndex":6,"endIndex":15,"origExpr":"OrderItem","name":"OrderItem"},"property":{"type":"Identifier","startIndex":16,"endIndex":24,"origExpr":"quantity","name":"quantity","belongsTo":"OrderItem"},"endIndex":24,"origExpr":"OrderItem.quantity"},{"type":"LogicalExpression","startIndex":26,"endIndex":71,"origExpr":"product_id == @[product_id] && quantity > 100","operator":"&&","left":{"type":"BinaryExpression","startIndex":26,"endIndex":56,"origExpr":"product_id == @[product_id] &","operator":"==","left":{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"right":{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":52,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"endIndex":53,"origExpr":"@[product_id]"}},"right":{"type":"BinaryExpression","startIndex":26,"endIndex":71,"origExpr":"product_id == @[product_id] && quantity > 100","operator":">","left":{"type":"Identifier","startIndex":57,"endIndex":65,"origExpr":"quantity","name":"quantity","belongsTo":"OrderItem"},"right":{"type":"NumberLiteral","startIndex":68,"endIndex":71,"origExpr":"100","value":100,"raw":"100"}}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"SUMIF","name":"SUMIF"},"endIndex":72,"origExpr":"SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)"},"mapreduceAggsOfManyObservablesQueryableFromOneObs":{"aggsViewName":"vaggs-OrderItem-SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)","map":{"entityName":"OrderItem","keyExpr":[{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},{"type":"Identifier","startIndex":57,"endIndex":65,"origExpr":"quantity","name":"quantity","belongsTo":"OrderItem"}],"valueExpr":{"type":"Identifier","startIndex":0,"endIndex":8,"origExpr":"quantity","name":"quantity"},"query":{"startkeyExpr":[{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":52,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"endIndex":53,"origExpr":"@[product_id]"},{"type":"NumberLiteral","startIndex":68,"endIndex":71,"origExpr":"100","value":100,"raw":"100"}],"endkeyExpr":[{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":52,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"endIndex":53,"origExpr":"@[product_id]"},{"type":"StringLiteral","startIndex":0,"endIndex":3,"origExpr":"'￰'","value":"￰","raw":"'￰'"}],"inclusive_start":false,"inclusive_end":false}},"reduceFun":{"name":"SumReduceFunN"}},"mapObserversImpactedByOneObservable":{"obsViewName":"vobs-LargeSalesProduct-SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)","entityName":"LargeSalesProduct","keyExpr":[{"type":"MemberExpression","startIndex":40,"computed":true,"object":{"type":"Literal","startIndex":40,"endIndex":41,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":42,"endIndex":52,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},"endIndex":53,"origExpr":"@[product_id]"},{"type":"NumberLiteral","startIndex":68,"endIndex":71,"origExpr":"100","value":100,"raw":"100"}],"query":{"startkeyExpr":[{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},{"type":"StringLiteral","startIndex":0,"endIndex":2,"origExpr":"''","value":"","raw":"''"}],"endkeyExpr":[{"type":"Identifier","startIndex":26,"endIndex":36,"origExpr":"product_id","name":"product_id","belongsTo":"OrderItem"},{"type":"Identifier","startIndex":57,"endIndex":65,"origExpr":"quantity","name":"quantity","belongsTo":"OrderItem"}],"inclusive_start":true,"inclusive_end":false},"valueExpr":{"type":"Identifier","startIndex":0,"endIndex":3,"origExpr":"_id","name":"_id"}}}]}}},"isEditable":true},"$Currency":{"_id":"$Currency","props":{"code":{"name":"code","propType_":"STRING"},"_id":{"name":"_id","propType_":"STRING","allowNull":false}},"isEditable":true},"$User":{"_id":"$User","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"role":{"name":"role","propType_":"STRING","allowNull":false},"password":{"name":"password","propType_":"STRING"},"name":{"name":"name","propType_":"STRING"},"details":{"name":"details","propType_":"STRING"}},"isEditable":true},"$Dictionary":{"_id":"$Dictionary","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"gb":{"name":"gb","propType_":"STRING"},"fr":{"name":"fr","propType_":"STRING"},"de":{"name":"de","propType_":"STRING"},"it":{"name":"it","propType_":"STRING"},"es":{"name":"es","propType_":"STRING"},"pt":{"name":"pl","propType_":"STRING"},"gr":{"name":"el","propType_":"STRING"},"ro":{"name":"ro","propType_":"STRING"},"bg":{"name":"bg","propType_":"STRING"},"da":{"name":"da","propType_":"STRING"},"sv":{"name":"sv","propType_":"STRING"},"no":{"name":"no","propType_":"STRING"},"nl":{"name":"nl","propType_":"STRING"}},"isEditable":true}}}
FRMDB_SCHEMA~~formuladb-examples--hotel-booking	{"_id":"FRMDB_SCHEMA~~formuladb-examples--hotel-booking","entities":{"RoomType":{"_id":"RoomType","isEditable":true,"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"name":{"name":"name","propType_":"STRING","allowNull":false},"description":{"name":"description","propType_":"STRING","allowNull":false},"picture":{"name":"picture","propType_":"IMAGE"},"long_description":{"name":"long_description","propType_":"STRING"},"price":{"name":"price","propType_":"NUMBER","allowNull":false},"wifi":{"name":"wifi","propType_":"BOOLEAN"},"parking":{"name":"parking","propType_":"BOOLEAN"}}},"Room":{"_id":"Room","isEditable":true,"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"nb":{"name":"nb","propType_":"NUMBER","allowNull":false},"room_type":{"name":"room_type","propType_":"REFERENCE_TO","referencedEntityName":"RoomType","referencedPropertyName":"_id"}}},"Booking":{"_id":"Booking","isEditable":true,"stateGraph":{"nodes":["PENDING","FINALIZED","CANCELLED"],"transitions":[{"source":"PENDING","target":"FINALIZED"},{"source":"PENDING","target":"CANCELLED"},{"source":"FINALIZED","target":"CANCELLED"}]},"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"guest":{"name":"guest","propType_":"REFERENCE_TO","referencedEntityName":"$User","referencedPropertyName":"_id"},"room":{"name":"room","propType_":"REFERENCE_TO","referencedEntityName":"Room","referencedPropertyName":"_id"},"start_date":{"name":"start_date","propType_":"DATETIME","allowNull":false},"end_date":{"name":"end_date","propType_":"DATETIME","allowNull":false},"nb_adults":{"name":"nb_adults","propType_":"NUMBER","allowNull":false},"nb_children":{"name":"nb_children","propType_":"NUMBER","allowNull":false},"days":{"name":"days","propType_":"FORMULA","formula":"DATEDIF(start_date, end_date, \\"D\\") + 1","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"BinaryExpression","startIndex":0,"endIndex":38,"origExpr":"DATEDIF(start_date, end_date, \\"D\\") + 1","operator":"+","left":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"Identifier","startIndex":8,"endIndex":18,"origExpr":"start_date","name":"start_date"},{"type":"Identifier","startIndex":20,"endIndex":28,"origExpr":"end_date","name":"end_date"},{"type":"StringLiteral","startIndex":30,"endIndex":33,"origExpr":"\\"D\\"","value":"D","raw":"\\"D\\""}],"callee":{"type":"Identifier","startIndex":0,"endIndex":7,"origExpr":"DATEDIF","name":"DATEDIF"},"endIndex":34,"origExpr":"DATEDIF(start_date, end_date, \\"D\\")"},"right":{"type":"NumberLiteral","startIndex":37,"endIndex":38,"origExpr":"1","value":1,"raw":"1"}},"finalExpression":{"type":"BinaryExpression","startIndex":0,"endIndex":38,"origExpr":"DATEDIF(start_date, end_date, \\"D\\") + 1","operator":"+","left":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"Identifier","startIndex":8,"endIndex":18,"origExpr":"start_date","name":"start_date"},{"type":"Identifier","startIndex":20,"endIndex":28,"origExpr":"end_date","name":"end_date"},{"type":"StringLiteral","startIndex":30,"endIndex":33,"origExpr":"\\"D\\"","value":"D","raw":"\\"D\\""}],"callee":{"type":"Identifier","startIndex":0,"endIndex":7,"origExpr":"DATEDIF","name":"DATEDIF"},"endIndex":34,"origExpr":"DATEDIF(start_date, end_date, \\"D\\")"},"right":{"type":"NumberLiteral","startIndex":37,"endIndex":38,"origExpr":"1","value":1,"raw":"1"}},"targetEntityName":"Booking","targetPropertyName":"days"}},"cost":{"name":"cost","propType_":"FORMULA","formula":"days * 100","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"BinaryExpression","startIndex":0,"endIndex":10,"origExpr":"days * 100","operator":"*","left":{"type":"Identifier","startIndex":0,"endIndex":4,"origExpr":"days","name":"days"},"right":{"type":"NumberLiteral","startIndex":7,"endIndex":10,"origExpr":"100","value":100,"raw":"100"}},"finalExpression":{"type":"BinaryExpression","startIndex":0,"endIndex":10,"origExpr":"days * 100","operator":"*","left":{"type":"Identifier","startIndex":0,"endIndex":4,"origExpr":"days","name":"days"},"right":{"type":"NumberLiteral","startIndex":7,"endIndex":10,"origExpr":"100","value":100,"raw":"100"}},"targetEntityName":"Booking","targetPropertyName":"cost"}},"bookings_for_the_same_room":{"name":"bookings_for_the_same_room","propType_":"FORMULA","formula":"\\"FILTER(Booking, @[booking_item_id] == booking_item_id)\\"","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"StringLiteral","startIndex":0,"endIndex":56,"origExpr":"\\"FILTER(Booking, @[booking_item_id] == booking_item_id)\\"","value":"FILTER(Booking, @[booking_item_id] == booking_item_id)","raw":"\\"FILTER(Booking, @[booking_item_id] == booking_item_id)\\""},"finalExpression":{"type":"StringLiteral","startIndex":0,"endIndex":56,"origExpr":"\\"FILTER(Booking, @[booking_item_id] == booking_item_id)\\"","value":"FILTER(Booking, @[booking_item_id] == booking_item_id)","raw":"\\"FILTER(Booking, @[booking_item_id] == booking_item_id)\\""},"targetEntityName":"Booking","targetPropertyName":"bookings_for_the_same_room"}}}},"$User":{"_id":"$User","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"role":{"name":"role","propType_":"STRING","allowNull":false},"password":{"name":"password","propType_":"STRING"},"name":{"name":"name","propType_":"STRING"},"details":{"name":"details","propType_":"STRING"}},"isEditable":true},"$Dictionary":{"_id":"$Dictionary","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"gb":{"name":"gb","propType_":"STRING"},"fr":{"name":"fr","propType_":"STRING"},"de":{"name":"de","propType_":"STRING"},"it":{"name":"it","propType_":"STRING"},"es":{"name":"es","propType_":"STRING"},"pt":{"name":"pl","propType_":"STRING"},"gr":{"name":"el","propType_":"STRING"},"ro":{"name":"ro","propType_":"STRING"},"bg":{"name":"bg","propType_":"STRING"},"da":{"name":"da","propType_":"STRING"},"sv":{"name":"sv","propType_":"STRING"},"no":{"name":"no","propType_":"STRING"},"nl":{"name":"nl","propType_":"STRING"}},"isEditable":true},"$Currency":{"_id":"$Currency","props":{"code":{"name":"code","propType_":"STRING"},"_id":{"name":"_id","propType_":"STRING","allowNull":false}},"isEditable":true}}}
FRMDB_SCHEMA~~formuladb-internal--formuladb.io	{"_id":"FRMDB_SCHEMA~~formuladb-internal--formuladb.io","entities":{"SampleApp":{"_id":"SampleApp","isEditable":true,"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"name":{"name":"name","propType_":"FORMULA","formula":"REGEXREPLACE(_id, \\"SampleApp~~[0-9]+ \\", \\"\\")","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"Identifier","startIndex":13,"endIndex":16,"origExpr":"_id","name":"_id"},{"type":"StringLiteral","startIndex":18,"endIndex":38,"origExpr":"\\"SampleApp~~[0-9]+ \\"","value":"SampleApp~~[0-9]+ ","raw":"\\"SampleApp~~[0-9]+ \\""},{"type":"StringLiteral","startIndex":40,"endIndex":42,"origExpr":"\\"\\"","value":"","raw":"\\"\\""}],"callee":{"type":"Identifier","startIndex":0,"endIndex":12,"origExpr":"REGEXREPLACE","name":"REGEXREPLACE"},"endIndex":43,"origExpr":"REGEXREPLACE(_id, \\"SampleApp~~[0-9]+ \\", \\"\\")"},"finalExpression":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"Identifier","startIndex":13,"endIndex":16,"origExpr":"_id","name":"_id"},{"type":"StringLiteral","startIndex":18,"endIndex":38,"origExpr":"\\"SampleApp~~[0-9]+ \\"","value":"SampleApp~~[0-9]+ ","raw":"\\"SampleApp~~[0-9]+ \\""},{"type":"StringLiteral","startIndex":40,"endIndex":42,"origExpr":"\\"\\"","value":"","raw":"\\"\\""}],"callee":{"type":"Identifier","startIndex":0,"endIndex":12,"origExpr":"REGEXREPLACE","name":"REGEXREPLACE"},"endIndex":43,"origExpr":"REGEXREPLACE(_id, \\"SampleApp~~[0-9]+ \\", \\"\\")"},"targetEntityName":"SampleApp","targetPropertyName":"name"}},"category":{"name":"category","propType_":"REFERENCE_TO","referencedEntityName":"AppCategory","referencedPropertyName":"_id"},"category2":{"name":"category2","propType_":"REFERENCE_TO","referencedEntityName":"AppCategory","referencedPropertyName":"_id"},"categories":{"name":"categories","propType_":"FORMULA","formula":"CONCATENATE(category, category2)","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"Identifier","startIndex":12,"endIndex":20,"origExpr":"category","name":"category"},{"type":"Identifier","startIndex":22,"endIndex":31,"origExpr":"category2","name":"category2"}],"callee":{"type":"Identifier","startIndex":0,"endIndex":11,"origExpr":"CONCATENATE","name":"CONCATENATE"},"endIndex":32,"origExpr":"CONCATENATE(category, category2)"},"finalExpression":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"Identifier","startIndex":12,"endIndex":20,"origExpr":"category","name":"category"},{"type":"Identifier","startIndex":22,"endIndex":31,"origExpr":"category2","name":"category2"}],"callee":{"type":"Identifier","startIndex":0,"endIndex":11,"origExpr":"CONCATENATE","name":"CONCATENATE"},"endIndex":32,"origExpr":"CONCATENATE(category, category2)"},"targetEntityName":"SampleApp","targetPropertyName":"categories"}},"app_url":{"name":"app_url","propType_":"STRING","allowNull":false},"short_description":{"name":"short_description","propType_":"STRING","allowNull":false},"wish_list_count":{"name":"wish_list_count","propType_":"FORMULA","formula":"COUNTIF(WishListRequest._id, app == @[_id])","compiledFormula_":{"type_":"CompiledFormulaN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"MemberExpression","startIndex":8,"computed":false,"object":{"type":"Identifier","startIndex":8,"endIndex":23,"origExpr":"WishListRequest","name":"WishListRequest"},"property":{"type":"Identifier","startIndex":24,"endIndex":27,"origExpr":"_id","name":"_id","belongsTo":"WishListRequest"},"endIndex":27,"origExpr":"WishListRequest._id"},{"type":"BinaryExpression","startIndex":29,"endIndex":42,"origExpr":"app == @[_id]","operator":"==","left":{"type":"Identifier","startIndex":29,"endIndex":32,"origExpr":"app","name":"app","belongsTo":"WishListRequest"},"right":{"type":"MemberExpression","startIndex":36,"computed":true,"object":{"type":"Literal","startIndex":36,"endIndex":37,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":38,"endIndex":41,"origExpr":"_id","name":"_id","belongsTo":"WishListRequest"},"endIndex":42,"origExpr":"@[_id]"}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":7,"origExpr":"COUNTIF","name":"COUNTIF"},"endIndex":43,"origExpr":"COUNTIF(WishListRequest._id, app == @[_id])"},"finalExpression":{"type":"MemberExpression","startIndex":0,"computed":true,"object":{"type":"Identifier","startIndex":0,"endIndex":5,"origExpr":"$TRG$","name":"$TRG$"},"property":{"type":"StringLiteral","startIndex":6,"endIndex":73,"origExpr":"'vaggs-WishListRequest-COUNTIF(WishListRequest._id, app == @[_id])'","value":"vaggs-WishListRequest-COUNTIF(WishListRequest._id, app == @[_id])","raw":"'vaggs-WishListRequest-COUNTIF(WishListRequest._id, app == @[_id])'"},"endIndex":74,"origExpr":"$TRG$['vaggs-WishListRequest-COUNTIF(WishListRequest._id, app == @[_id])']"},"targetEntityName":"SampleApp","targetPropertyName":"wish_list_count","triggers":[{"type_":"MapReduceTriggerN","rawExpr":{"type":"CallExpression","startIndex":0,"arguments":[{"type":"MemberExpression","startIndex":8,"computed":false,"object":{"type":"Identifier","startIndex":8,"endIndex":23,"origExpr":"WishListRequest","name":"WishListRequest"},"property":{"type":"Identifier","startIndex":24,"endIndex":27,"origExpr":"_id","name":"_id","belongsTo":"WishListRequest"},"endIndex":27,"origExpr":"WishListRequest._id"},{"type":"BinaryExpression","startIndex":29,"endIndex":42,"origExpr":"app == @[_id]","operator":"==","left":{"type":"Identifier","startIndex":29,"endIndex":32,"origExpr":"app","name":"app","belongsTo":"WishListRequest"},"right":{"type":"MemberExpression","startIndex":36,"computed":true,"object":{"type":"Literal","startIndex":36,"endIndex":37,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":38,"endIndex":41,"origExpr":"_id","name":"_id","belongsTo":"WishListRequest"},"endIndex":42,"origExpr":"@[_id]"}}],"callee":{"type":"Identifier","startIndex":0,"endIndex":7,"origExpr":"COUNTIF","name":"COUNTIF"},"endIndex":43,"origExpr":"COUNTIF(WishListRequest._id, app == @[_id])"},"mapreduceAggsOfManyObservablesQueryableFromOneObs":{"aggsViewName":"vaggs-WishListRequest-COUNTIF(WishListRequest._id, app == @[_id])","map":{"entityName":"WishListRequest","keyExpr":[{"type":"Identifier","startIndex":29,"endIndex":32,"origExpr":"app","name":"app","belongsTo":"WishListRequest"}],"valueExpr":{"type":"NumberLiteral","startIndex":0,"endIndex":1,"origExpr":"1","value":1,"raw":"1"},"query":{"startkeyExpr":[{"type":"MemberExpression","startIndex":36,"computed":true,"object":{"type":"Literal","startIndex":36,"endIndex":37,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":38,"endIndex":41,"origExpr":"_id","name":"_id","belongsTo":"WishListRequest"},"endIndex":42,"origExpr":"@[_id]"}],"endkeyExpr":[{"type":"MemberExpression","startIndex":36,"computed":true,"object":{"type":"Literal","startIndex":36,"endIndex":37,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":38,"endIndex":41,"origExpr":"_id","name":"_id","belongsTo":"WishListRequest"},"endIndex":42,"origExpr":"@[_id]"}],"inclusive_start":true,"inclusive_end":true}},"reduceFun":{"name":"CountReduceFunN"}},"mapObserversImpactedByOneObservable":{"obsViewName":"vobs-SampleApp-COUNTIF(WishListRequest._id, app == @[_id])","entityName":"SampleApp","keyExpr":[{"type":"MemberExpression","startIndex":36,"computed":true,"object":{"type":"Literal","startIndex":36,"endIndex":37,"origExpr":"@","value":"@","raw":"@"},"property":{"type":"Identifier","startIndex":38,"endIndex":41,"origExpr":"_id","name":"_id","belongsTo":"WishListRequest"},"endIndex":42,"origExpr":"@[_id]"}],"query":{"startkeyExpr":[{"type":"Identifier","startIndex":29,"endIndex":32,"origExpr":"app","name":"app","belongsTo":"WishListRequest"}],"endkeyExpr":[{"type":"Identifier","startIndex":29,"endIndex":32,"origExpr":"app","name":"app","belongsTo":"WishListRequest"}],"inclusive_start":true,"inclusive_end":true},"valueExpr":{"type":"Identifier","startIndex":0,"endIndex":3,"origExpr":"_id","name":"_id"}}}]}},"small_img":{"name":"small_img","propType_":"IMAGE","allowNull":false},"long_img":{"name":"long_img","propType_":"IMAGE","allowNull":false}}},"WishListRequest":{"_id":"WishListRequest","isEditable":true,"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"app":{"name":"app","propType_":"REFERENCE_TO","referencedEntityName":"SampleApp","referencedPropertyName":"_id"},"email":{"name":"email","propType_":"STRING","allowNull":false},"comments":{"name":"comments","propType_":"STRING"}}},"AppCategory":{"_id":"AppCategory","isEditable":true,"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false}}},"ContactRequest":{"_id":"ContactRequest","isEditable":true,"props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"email":{"name":"email","propType_":"STRING","allowNull":false},"comments":{"name":"comments","propType_":"STRING"}}},"$User":{"_id":"$User","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"role":{"name":"role","propType_":"STRING","allowNull":false},"password":{"name":"password","propType_":"STRING"},"name":{"name":"name","propType_":"STRING"},"details":{"name":"details","propType_":"STRING"}},"isEditable":true},"$Dictionary":{"_id":"$Dictionary","props":{"_id":{"name":"_id","propType_":"STRING","allowNull":false},"gb":{"name":"gb","propType_":"STRING"},"fr":{"name":"fr","propType_":"STRING"},"de":{"name":"de","propType_":"STRING"},"it":{"name":"it","propType_":"STRING"},"es":{"name":"es","propType_":"STRING"},"pt":{"name":"pl","propType_":"STRING"},"gr":{"name":"el","propType_":"STRING"},"ro":{"name":"ro","propType_":"STRING"},"bg":{"name":"bg","propType_":"STRING"},"da":{"name":"da","propType_":"STRING"},"sv":{"name":"sv","propType_":"STRING"},"no":{"name":"no","propType_":"STRING"},"nl":{"name":"nl","propType_":"STRING"}},"isEditable":true},"$Currency":{"_id":"$Currency","props":{"code":{"name":"code","propType_":"STRING"},"_id":{"name":"_id","propType_":"STRING","allowNull":false}},"isEditable":true}}}
\.


--
-- Data for Name: torderitem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.torderitem (_id, product_id, quantity, error_quantity, client_stock, units) FROM stdin;
OrderItem~~1__1	ProductLocation~~1__1	10.00000	\N	\N	\N
OrderItem~~1__2	ProductLocation~~1__1a	4.00000	\N	\N	\N
\.


--
-- Data for Name: tproductlocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tproductlocation (_id, product_id, location_code, category, received_stock__, available_stock__, ordered_stock__, price, currency__, minimal_stock, moving_stock, state) FROM stdin;
ProductLocation~~1__2a	InventoryProduct~~2a	Warehouse1	C1	0.00000	0.00000	0.00000	2.50000	\N	\N	\N	\N
ProductLocation~~1__3a	InventoryProduct~~3a	Warehouse1	C1	0.00000	0.00000	0.00000	3.50000	\N	\N	\N	\N
ProductLocation~~1__4a	InventoryProduct~~4a	Warehouse1	C1	0.00000	0.00000	0.00000	4.50000	\N	\N	\N	\N
ProductLocation~~1__5a	InventoryProduct~~5a	Warehouse1	C1	0.00000	0.00000	0.00000	5.50000	\N	\N	\N	\N
ProductLocation~~1__6a	InventoryProduct~~6a	Warehouse1	C1	0.00000	0.00000	0.00000	6.50000	\N	\N	\N	\N
ProductLocation~~1__7a	InventoryProduct~~7a	Warehouse1	C1	0.00000	0.00000	0.00000	7.50000	\N	\N	\N	\N
ProductLocation~~1__8a	InventoryProduct~~8a	Warehouse1	C1	0.00000	0.00000	0.00000	8.50000	\N	\N	\N	\N
ProductLocation~~1__9a	InventoryProduct~~9a	Warehouse1	C1	0.00000	0.00000	0.00000	9.50000	\N	\N	\N	\N
ProductLocation~~1__10	InventoryProduct~~10	Warehouse1	C1	0.00000	0.00000	0.00000	10.50000	\N	\N	\N	\N
ProductLocation~~1__11	InventoryProduct~~11	Warehouse1	C1	0.00000	0.00000	0.00000	11.50000	\N	\N	\N	\N
ProductLocation~~1__12	InventoryProduct~~12	Warehouse1	C1	0.00000	0.00000	0.00000	12.50000	\N	\N	\N	\N
ProductLocation~~1__13	InventoryProduct~~13	Warehouse1	C1	0.00000	0.00000	0.00000	13.50000	\N	\N	\N	\N
ProductLocation~~1__14	InventoryProduct~~14	Warehouse1	C1	0.00000	0.00000	0.00000	14.50000	\N	\N	\N	\N
ProductLocation~~1__15	InventoryProduct~~15	Warehouse1	C1	0.00000	0.00000	0.00000	15.50000	\N	\N	\N	\N
ProductLocation~~1__16	InventoryProduct~~16	Warehouse1	C1	0.00000	0.00000	0.00000	16.50000	\N	\N	\N	\N
ProductLocation~~1__17	InventoryProduct~~17	Warehouse1	C1	0.00000	0.00000	0.00000	17.50000	\N	\N	\N	\N
ProductLocation~~1__18	InventoryProduct~~18	Warehouse1	C2	0.00000	0.00000	0.00000	18.50000	\N	\N	\N	\N
ProductLocation~~1__19	InventoryProduct~~19	Warehouse1	C2	0.00000	0.00000	0.00000	19.50000	\N	\N	\N	\N
ProductLocation~~1__20	InventoryProduct~~20	Warehouse1	C2	0.00000	0.00000	0.00000	20.50000	\N	\N	\N	\N
ProductLocation~~1__21	InventoryProduct~~21	Warehouse1	C2	0.00000	0.00000	0.00000	21.50000	\N	\N	\N	\N
ProductLocation~~1__22	InventoryProduct~~22	Warehouse1	C2	0.00000	0.00000	0.00000	22.50000	\N	\N	\N	\N
ProductLocation~~1__23	InventoryProduct~~23	Warehouse1	C2	0.00000	0.00000	0.00000	23.50000	\N	\N	\N	\N
ProductLocation~~1__24	InventoryProduct~~24	Warehouse1	C2	0.00000	0.00000	0.00000	24.50000	\N	\N	\N	\N
ProductLocation~~1__25	InventoryProduct~~25	Warehouse1	C2	0.00000	0.00000	0.00000	25.50000	\N	\N	\N	\N
\.


--
-- Data for Name: treceiptitem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treceiptitem (_id, product_id, quantity, price, units) FROM stdin;
ReceiptItem~~1__1	ProductLocation~~1__1	15.00000	123.5	\N
ReceiptItem~~1__2	ProductLocation~~1__1a	5.00000	1.5	\N
ReceiptItem~~2__1	ProductLocation~~1__1	10.00000	123.5	\N
ReceiptItem~~2__2	ProductLocation~~1__1a	5.00000	1.5	\N
\.


--
-- Data for Name: troom; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.troom (_id, nb, room_type) FROM stdin;
Room~~DoubleDeluxe1	101.00000	RoomType~~01-DoubleDeluxe
Room~~DoubleDeluxe2	102.00000	RoomType~~01-DoubleDeluxe
Room~~DoubleDeluxe3	103.00000	RoomType~~01-DoubleDeluxe
Room~~DoubleDeluxe4	104.00000	RoomType~~01-DoubleDeluxe
Room~~SigleDeluxe1	201.00000	RoomType~~02-SigleDeluxe
Room~~SigleDeluxe2	202.00000	RoomType~~02-SigleDeluxe
Room~~SigleDeluxe3	203.00000	RoomType~~02-SigleDeluxe
Room~~SigleDeluxe4	204.00000	RoomType~~02-SigleDeluxe
Room~~Honeymoon1	301.00000	RoomType~~03-Honeymoon
Room~~Honeymoon2	302.00000	RoomType~~03-Honeymoon
Room~~Honeymoon3	303.00000	RoomType~~03-Honeymoon
Room~~Honeymoon4	304.00000	RoomType~~03-Honeymoon
Room~~EconomyDouble1	401.00000	RoomType~~04-EconomyDouble
Room~~EconomyDouble2	402.00000	RoomType~~04-EconomyDouble
Room~~EconomyDouble3	403.00000	RoomType~~04-EconomyDouble
Room~~EconomyDouble4	404.00000	RoomType~~04-EconomyDouble
Room~~EconomySigle1	501.00000	RoomType~~05-EconomySigle
Room~~EconomySigle2	502.00000	RoomType~~05-EconomySigle
Room~~EconomySigle3	503.00000	RoomType~~05-EconomySigle
Room~~EconomySigle4	504.00000	RoomType~~05-EconomySigle
Room~~Conference1	601.00000	RoomType~~06-Conference
Room~~Ball1	701.00000	RoomType~~07-Ball
\.


--
-- Data for Name: troomtype; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.troomtype (_id, name, description, picture, long_description, price, wifi, parking) FROM stdin;
RoomType~~01-DoubleDeluxe	Double Deluxe Room	Quas reiciendis non et eveniet iure aut.	theme/image/room1.jpg	Doloribus recusandae fuga ea magnam. Magnam unde culpa sed voluptates alias veniam quis ea provident. Qui ad rerum laborum quas eum quisquam.\n \rIpsam voluptates quaerat molestias. Aperiam eos explicabo voluptate id est molestias iusto. Aliquam dolores sit quo quia. Nobis doloremque aut neque. Enim et sit nobis minima est ipsa ut mollitia. Odio aut nemo dolorum repellat occaecati possimus quia saepe consequuntur.\n \rVoluptas nisi qui dolore commodi quis fugiat fuga. Ipsam qui quasi ad. Sapiente repellendus quidem qui dolorum. Asperiores vel velit repellat aut voluptate excepturi. Doloribus quia accusamus qui hic blanditiis. Totam et reprehenderit autem sequi eveniet quas sapiente et dolores.	300.00000	true	false
RoomType~~02-SigleDeluxe	Single Deluxe Room	Libero voluptatem aut.	theme/image/room2.jpg	Velit saepe nam aspernatur ut expedita. Delectus accusantium ut non voluptate dolorem asperiores fuga ipsa. Ut animi tempora sed nihil et. Id voluptatum aut soluta suscipit. Qui ut illo et. Soluta adipisci sint.\n \rEst rerum vel est facilis dolorum ut. Provident corrupti doloremque et. Nihil culpa et rem libero. Beatae iste quidem et nulla asperiores atque voluptatem.\n \rUt temporibus incidunt. Unde dignissimos impedit eligendi veritatis hic et dolores. Tempore animi velit repudiandae beatae vero.	180.00000	true	false
RoomType~~03-Honeymoon	Honeymoon Suit	Aut culpa iusto harum ad.	theme/image/room3.jpg	Earum dolore hic fugit ad delectus reprehenderit consequatur inventore. Dolore autem dolor cum et ipsa facilis. Eius eligendi incidunt et sapiente et laborum tempora. Et blanditiis quo praesentium mollitia inventore qui.\n \rEos iure voluptate distinctio sed dolor. Id asperiores ut unde illum modi velit non. Sit dolorem velit. Sed soluta velit. Accusantium et aliquam.\n \rAutem praesentium aspernatur reprehenderit praesentium sed. Perspiciatis architecto quia non neque. Sint repellat omnis enim officia est rerum. Similique quia fugiat odio cumque accusantium dolor. Molestiae animi impedit voluptate maiores ipsam rem excepturi sed. Pariatur dolorem voluptatem non est enim assumenda impedit.	400.00000	true	false
RoomType~~04-EconomyDouble	Economy Double	Assumenda nostrum quaerat fugit nesciunt libero aliquam.	theme/image/room4.jpg	Quia minus veritatis quidem autem et sed qui qui. Aut qui repellendus aut et ipsum porro. Illo vel optio quisquam voluptatibus vel enim qui sint et. Doloribus quis ea reprehenderit aliquam deleniti rem nesciunt temporibus sequi.\n \rMinima cum minima sed consequatur deleniti voluptate dolor vero. Cupiditate quibusdam voluptatibus eum et distinctio laudantium numquam. Facere maxime ut accusantium est id culpa. Reprehenderit maiores at. Et laboriosam explicabo ab sed tempore exercitationem enim perspiciatis. Corrupti omnis cum qui nostrum.\n \rDignissimos corporis molestiae velit qui. Ea dolores ea fugit facilis atque blanditiis praesentium aut. Iure rem aliquam.	200.00000	true	false
RoomType~~05-EconomySigle	Economy Sigle	Assumenda nostrum quaerat fugit nesciunt libero aliquam.	theme/image/bedroom-1872196_1920.jpg	Quia minus veritatis quidem autem et sed qui qui. Aut qui repellendus aut et ipsum porro. Illo vel optio quisquam voluptatibus vel enim qui sint et. Doloribus quis ea reprehenderit aliquam deleniti rem nesciunt temporibus sequi.\n \rMinima cum minima sed consequatur deleniti voluptate dolor vero. Cupiditate quibusdam voluptatibus eum et distinctio laudantium numquam. Facere maxime ut accusantium est id culpa. Reprehenderit maiores at. Et laboriosam explicabo ab sed tempore exercitationem enim perspiciatis. Corrupti omnis cum qui nostrum.\n \rDignissimos corporis molestiae velit qui. Ea dolores ea fugit facilis atque blanditiis praesentium aut. Iure rem aliquam.	100.00000	true	false
RoomType~~06-Conference	Conference Room	Assumenda nostrum quaerat fugit nesciunt libero aliquam.	theme/image/living-room-581073_1920.jpg	Quia minus veritatis quidem autem et sed qui qui. Aut qui repellendus aut et ipsum porro. Illo vel optio quisquam voluptatibus vel enim qui sint et. Doloribus quis ea reprehenderit aliquam deleniti rem nesciunt temporibus sequi.\n \rMinima cum minima sed consequatur deleniti voluptate dolor vero. Cupiditate quibusdam voluptatibus eum et distinctio laudantium numquam. Facere maxime ut accusantium est id culpa. Reprehenderit maiores at. Et laboriosam explicabo ab sed tempore exercitationem enim perspiciatis. Corrupti omnis cum qui nostrum.\n \rDignissimos corporis molestiae velit qui. Ea dolores ea fugit facilis atque blanditiis praesentium aut. Iure rem aliquam.	4000.00000	true	false
RoomType~~07-Ball	Ball Room	Assumenda nostrum quaerat fugit nesciunt libero aliquam.	theme/image/interior-2685521_1920.jpg	Quia minus veritatis quidem autem et sed qui qui. Aut qui repellendus aut et ipsum porro. Illo vel optio quisquam voluptatibus vel enim qui sint et. Doloribus quis ea reprehenderit aliquam deleniti rem nesciunt temporibus sequi.\n \rMinima cum minima sed consequatur deleniti voluptate dolor vero. Cupiditate quibusdam voluptatibus eum et distinctio laudantium numquam. Facere maxime ut accusantium est id culpa. Reprehenderit maiores at. Et laboriosam explicabo ab sed tempore exercitationem enim perspiciatis. Corrupti omnis cum qui nostrum.\n \rDignissimos corporis molestiae velit qui. Ea dolores ea fugit facilis atque blanditiis praesentium aut. Iure rem aliquam.	10000.00000	true	false
\.


--
-- Data for Name: tsampleapp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tsampleapp (_id, name, category, category2, categories, app_url, short_description, wish_list_count, small_img, long_img) FROM stdin;
SampleApp~~010 Basic Inventory	Basic Inventory	AppCategory~~Business Administration		AppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~010 Basic Inventory')	Products, Stocks, Orders, Receipts, Transactions, Validations	0.00000	\N	assets/images/inventory.jpg
SampleApp~~020 Hotel Booking	Hotel Booking	AppCategory~~Booking & Appointments		AppCategory~~Booking & Appointments	/formuladb-editor/editor.html#/formuladb-examples/hotel-booking/index.html	Room Booking, Galery, Contact	0.00000	\N	assets/images/83-royal-hotel.png
SampleApp~~040 Service Management	Service Management	AppCategory~~Maintenance Services		AppCategory~~Maintenance Services	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~040 Service Management')	Service forms, customer tickets/incidents, spare parts, inventory	0.00000	\N	assets/images/management.jpg
SampleApp~~050 Reporting & Business Inteligence	Reporting & Business Inteligence	AppCategory~~Business Administration	AppCategory~~Startup Management	AppCategory~~Business AdministrationAppCategory~~Startup Management	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~050 Reporting & Business Inteligence')	Data sources, Integrations, Reports, Charts	0.00000	\N	assets/images/reporting.jpg
SampleApp~~060 Expenses & budgets	Expenses & budgets	AppCategory~~Business Administration	AppCategory~~Startup Management	AppCategory~~Business AdministrationAppCategory~~Startup Management	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~060 Expenses & budgets')	Forecasts, receipts, reports	0.00000	\N	assets/images/expenses.jpg
SampleApp~~070 Blog	Blog	AppCategory~~Design & Media		AppCategory~~Design & Media	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~070 Blog')	Blog Posts, Writers, Embed Blog section in any web app	0.00000	\N	assets/images/100-blanca.png
SampleApp~~080 Photography services	Photography services	AppCategory~~Photography		AppCategory~~Photography	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~080 Photography services')	Presentation website, photoshoot appointmens	0.00000	\N	assets/images/23-photography.png
SampleApp~~090 Design services 	Design services 	AppCategory~~Design & Media		AppCategory~~Design & Media	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~090 Design services ')	Portfolio, customer plans, designs (pdf,images, attachments)	0.00000	\N	assets/images/50-interior.png
SampleApp~~100 Wellness services	Wellness services	AppCategory~~Medical & Health		AppCategory~~Medical & Health	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~100 Wellness services')	Showcase, blog, appointments	0.00000	\N	assets/images/47-burnout.png
SampleApp~~110 Health clinic	Health clinic	AppCategory~~Medical & Health		AppCategory~~Medical & Health	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~110 Health clinic')	Presentation website, patients, appointments, articles/blog posts	0.00000	\N	assets/images/61-medi-life.png
SampleApp~~120 Dental services	Dental services	AppCategory~~Medical & Health		AppCategory~~Medical & Health	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~120 Dental services')	Presentation website, appointments, patients	0.00000	\N	assets/images/87-dentist.png
SampleApp~~130 Medical Doctor	Medical Doctor	AppCategory~~Medical & Health		AppCategory~~Medical & Health	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~130 Medical Doctor')	Presentation website, appointments, patients	0.00000	\N	assets/images/66-caremed.png
SampleApp~~140 Book Publishers	Book Publishers	AppCategory~~Design & Media		AppCategory~~Design & Media	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~140 Book Publishers')	Portfolio, Inventory, 	0.00000	\N	assets/images/24-book.png
SampleApp~~150 SEO tools	SEO tools	AppCategory~~Design & Media		AppCategory~~Design & Media	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~150 SEO tools')	Competion, kweywords, backlinks	0.00000	\N	assets/images/97-seo.png
SampleApp~~160 Advertising&Media Services	Advertising&Media Services	AppCategory~~Design & Media		AppCategory~~Design & Media	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~160 Advertising&Media Services')	Showcase, projects, designs (pdf, images, attachments)	0.00000	\N	assets/images/21-reveal.png
SampleApp~~170 Digital Creative Agency	Digital Creative Agency	AppCategory~~Design & Media		AppCategory~~Design & Media	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~170 Digital Creative Agency')	Showcase, projects, designs (pdf, images, attachments)	0.00000	\N	assets/images/16-datarc.png
\.


--
-- Data for Name: ttransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ttransaction (_id, val) FROM stdin;
1570730403664_av3T73Tgqjs8BYxestK15R	{"clientId_":"cx6Edvc84jHRWctamg8sym","state_":"ABORT","obj":{"_id":"ProductLocation~~1__1","product_id":"InventoryProduct~~1","location_code":"Warehouse1","category":"C1","price":123.5,"received_stock__":0,"ordered_stock__":10,"available_stock__":-10},"type_":"ServerEventModifiedFormData","_id":"1570730403664_av3T73Tgqjs8BYxestK15R","reason_":"ABORTED_FAILED_VALIDATIONS_RETRIES_EXCEEDED","error_":"Failed Validations: ProductLocation!positiveStock"}
1570730403930_jcAoJTehhCtzVxUFzz8ui7	{"clientId_":"irc5otXFKcqicRJk95wFDo","state_":"ABORT","obj":{"_id":"ProductLocation~~1__1a","product_id":"InventoryProduct~~1a","location_code":"Warehouse1","category":"C1","price":1.5,"received_stock__":0,"ordered_stock__":4,"available_stock__":-4},"type_":"ServerEventModifiedFormData","_id":"1570730403930_jcAoJTehhCtzVxUFzz8ui7","reason_":"ABORTED_FAILED_VALIDATIONS_RETRIES_EXCEEDED","error_":"Failed Validations: ProductLocation!positiveStock"}
\.


--
-- Data for Name: twishlistrequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.twishlistrequest (_id, app, email, comments) FROM stdin;
\.


--
-- Name: f_10010 f_10010_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_10010
    ADD CONSTRAINT f_10010_pkey PRIMARY KEY (_id);


--
-- Name: f_11552 f_11552_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_11552
    ADD CONSTRAINT f_11552_pkey PRIMARY KEY (_id);


--
-- Name: f_12671 f_12671_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_12671
    ADD CONSTRAINT f_12671_pkey PRIMARY KEY (_id);


--
-- Name: f_12849 f_12849_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_12849
    ADD CONSTRAINT f_12849_pkey PRIMARY KEY (_id);


--
-- Name: f_4914 f_4914_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_4914
    ADD CONSTRAINT f_4914_pkey PRIMARY KEY (_id);


--
-- Name: f_6844 f_6844_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_6844
    ADD CONSTRAINT f_6844_pkey PRIMARY KEY (_id);


--
-- Name: f_808 f_808_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_808
    ADD CONSTRAINT f_808_pkey PRIMARY KEY (_id);


--
-- Name: f_9745 f_9745_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_9745
    ADD CONSTRAINT f_9745_pkey PRIMARY KEY (_id);


--
-- Name: t_currency t_currency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.t_currency
    ADD CONSTRAINT t_currency_pkey PRIMARY KEY (_id);


--
-- Name: t_dictionary t_dictionary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.t_dictionary
    ADD CONSTRAINT t_dictionary_pkey PRIMARY KEY (_id);


--
-- Name: t_user t_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.t_user
    ADD CONSTRAINT t_user_pkey PRIMARY KEY (_id);


--
-- Name: tappcategory tappcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tappcategory
    ADD CONSTRAINT tappcategory_pkey PRIMARY KEY (_id);


--
-- Name: tbooking tbooking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tbooking
    ADD CONSTRAINT tbooking_pkey PRIMARY KEY (_id);


--
-- Name: tcontactrequest tcontactrequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tcontactrequest
    ADD CONSTRAINT tcontactrequest_pkey PRIMARY KEY (_id);


--
-- Name: tinventoryorder tinventoryorder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tinventoryorder
    ADD CONSTRAINT tinventoryorder_pkey PRIMARY KEY (_id);


--
-- Name: tinventoryproduct tinventoryproduct_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tinventoryproduct
    ADD CONSTRAINT tinventoryproduct_pkey PRIMARY KEY (_id);


--
-- Name: tinventoryproductunit tinventoryproductunit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tinventoryproductunit
    ADD CONSTRAINT tinventoryproductunit_pkey PRIMARY KEY (_id);


--
-- Name: tinventoryreceipt tinventoryreceipt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tinventoryreceipt
    ADD CONSTRAINT tinventoryreceipt_pkey PRIMARY KEY (_id);


--
-- Name: tlargesalesproduct tlargesalesproduct_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tlargesalesproduct
    ADD CONSTRAINT tlargesalesproduct_pkey PRIMARY KEY (_id);


--
-- Name: tlargesalesreport tlargesalesreport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tlargesalesreport
    ADD CONSTRAINT tlargesalesreport_pkey PRIMARY KEY (_id);


--
-- Name: tmetadata tmetadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tmetadata
    ADD CONSTRAINT tmetadata_pkey PRIMARY KEY (_id);


--
-- Name: torderitem torderitem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torderitem
    ADD CONSTRAINT torderitem_pkey PRIMARY KEY (_id);


--
-- Name: tproductlocation tproductlocation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tproductlocation
    ADD CONSTRAINT tproductlocation_pkey PRIMARY KEY (_id);


--
-- Name: treceiptitem treceiptitem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treceiptitem
    ADD CONSTRAINT treceiptitem_pkey PRIMARY KEY (_id);


--
-- Name: troom troom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.troom
    ADD CONSTRAINT troom_pkey PRIMARY KEY (_id);


--
-- Name: troomtype troomtype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.troomtype
    ADD CONSTRAINT troomtype_pkey PRIMARY KEY (_id);


--
-- Name: tsampleapp tsampleapp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tsampleapp
    ADD CONSTRAINT tsampleapp_pkey PRIMARY KEY (_id);


--
-- Name: ttransaction ttransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ttransaction
    ADD CONSTRAINT ttransaction_pkey PRIMARY KEY (_id);


--
-- Name: twishlistrequest twishlistrequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twishlistrequest
    ADD CONSTRAINT twishlistrequest_pkey PRIMARY KEY (_id);


--
-- PostgreSQL database dump complete
--
