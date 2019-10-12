--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5 (Debian 11.5-3.pgdg90+1)
-- Dumped by pg_dump version 12.0 (Debian 12.0-2.pgdg100+1)

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
SampleApp~~180 Real estate agency/brokerSampleApp~~180 Real estate agency/broker	\N
SampleApp~~190 Financial AdvisersSampleApp~~190 Financial Advisers	\N
SampleApp~~200 Law FirmSampleApp~~200 Law Firm	\N
SampleApp~~210 Barber shopSampleApp~~210 Barber shop	\N
SampleApp~~220 Beauty SalonSampleApp~~220 Beauty Salon	\N
SampleApp~~230 SpaSampleApp~~230 Spa	\N
SampleApp~~240 Bike store and serviceSampleApp~~240 Bike store and service	\N
SampleApp~~250 Water sportsSampleApp~~250 Water sports	\N
SampleApp~~260 GymSampleApp~~260 Gym	\N
SampleApp~~270 Trainer/EducatorSampleApp~~270 Trainer/Educator	\N
SampleApp~~280 Team planningSampleApp~~280 Team planning	\N
SampleApp~~290 Business PlanSampleApp~~290 Business Plan	\N
SampleApp~~300 Business Model CanvasSampleApp~~300 Business Model Canvas	\N
SampleApp~~310 Value Proposition CanvasSampleApp~~310 Value Proposition Canvas	\N
SampleApp~~320 HR RecruitSampleApp~~320 HR Recruit	\N
SampleApp~~330 RestaurantSampleApp~~330 Restaurant	\N
SampleApp~~340 HR ProcessesSampleApp~~340 HR Processes	\N
SampleApp~~350 Social Media ManagementSampleApp~~350 Social Media Management	\N
SampleApp~~360 Online StoreSampleApp~~360 Online Store	\N
SampleApp~~370 Event PlanningSampleApp~~370 Event Planning	\N
SampleApp~~380 Insurance BrokerSampleApp~~380 Insurance Broker	\N
SampleApp~~390 HelpdeskSampleApp~~390 Helpdesk	\N
SampleApp~~400 Credit BrokerSampleApp~~400 Credit Broker	\N
SampleApp~~410 PlaygroundSampleApp~~410 Playground	\N
SampleApp~~420 Project TrackingSampleApp~~420 Project Tracking	\N
SampleApp~~430 Legal case managementSampleApp~~430 Legal case management	\N
SampleApp~~440 Shopping/Packing ListsSampleApp~~440 Shopping/Packing Lists	\N
SampleApp~~450 CV/ ResumeSampleApp~~450 CV/ Resume	\N
SampleApp~~460 SurveySampleApp~~460 Survey	\N
SampleApp~~470 Art GallerySampleApp~~470 Art Gallery	\N
SampleApp~~480 MuseumSampleApp~~480 Museum	\N
SampleApp~~490 Exhibition areaSampleApp~~490 Exhibition area	\N
SampleApp~~500 TheaterSampleApp~~500 Theater	\N
SampleApp~~510 Basic WarehouseSampleApp~~510 Basic Warehouse	\N
SampleApp~~520 Users and RolesSampleApp~~520 Users and Roles	\N
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
Potato	\N	Patate	Kartoffel	Patata	Patata	\N	\N	Cartof	картоф	\N	Potatis	\N	Aardappel
Child	\N	Enfant	Kind	Bambino	Niño	\N	\N	Copil	дете	\N	Barn	\N	Kind
Younger	\N	Plus jeune	Jünger	Minore	Mas joven	\N	\N	Mai tanara	По-млад	\N	Yngre	\N	Jonger
Room 03	\N	Chambre 03	Raum 03	Stanza 03	Sala 03	\N	\N	Camera 03	Стая 03	\N	Rum 03	\N	Kamer 03
Baby	\N	Bébé	Baby	Bambino	Bebé	\N	\N	Bebelus	бебе	\N	Bebis	\N	Baby
Room 01	\N	Chambre 01	Raum 01	Stanza 01	Sala 01	\N	\N	Camera 01	Стая 01	\N	Rum 01	\N	Kamer 01
2014	\N	2014	2014	2014	2014	\N	\N	2014	2014	\N	2014	\N	2014
2011	\N	2011	2011	2011	2011	\N	\N	2011	2011	\N	2011	\N	2011
2017	\N	2017	2017	2017	2017	\N	\N	2017	2017	\N	2017	\N	2017
2015	\N	2015	2015	2015	2015	\N	\N	2015	2015	\N	2015	\N	2015
Room 02	\N	Chambre 02	Raum 02	Stanza 02	Sala 02	\N	\N	Camera 02	Стая 02	\N	Rum 02	\N	Kamer 02
Old	\N	Vieux	Alt	Vecchio	Antiguo	\N	\N	Vechi	Стар	\N	Gammal	\N	Oud
Elemests	\N	Elemests	Elemeste	Elemests	Elemests	\N	\N	Elemests	Elemests	\N	Elemests	\N	Elemests
Number of Rooms	\N	Nombre de chambres	Anzahl der Räume	Numero di stanze	Número de habitaciones	\N	\N	Număr de camere	Брой стаи	\N	Antal rum	\N	Aantal kamers
2018	\N	2018	2018	2018	2018	\N	\N	2018	2018	\N	2018	\N	2018
18:00	\N	18h00	18:00	18:00	18:00	\N	\N	18:00	18:00	\N	18:00	\N	18:00
20:00	\N	20h00	20:00	20:00	20:00	\N	\N	20:00	20:00	\N	20:00	\N	20:00
May	\N	Mai	Kann	potrebbe	Mayo	\N	\N	Mai	Може	\N	Maj	\N	mei
18:45	\N	18h45	18:45	\N	18:45	\N	\N	18:45	18:45	\N	18:45	\N	18:45
Fanny Spencer	\N	Fanny Spencer	Fanny Spencer	Fanny Spencer	Fanny Spencer	Fanny Spencer	Fanny Spencer	Fanny Spencer	Фани Спенсър	\N	Fanny Spencer	\N	Fanny Spencer
Economy Double	\N	Double Economy	Economy Doppelzimmer	Doppia Economy	Doble Economy	Pokój Dwuosobowy Economy	Οικονομικό Διπλό	Economie dublă	Икономичен двоен	\N	Ekonomi dubbel	\N	Economy dubbel
About us	\N	À propos de nous	Über uns	Riguardo a noi	Sobre nosotros	O nas	Σχετικά με εμάς	Despre noi	За нас	\N	Om oss	\N	Over ons
Blog	\N	Blog	Blog	blog	Blog	Blog	Blog	Blog	Блог	\N	blogg	\N	blog
Departure Date	\N	Date de départ	Abreisedatum	Data di partenza	Fecha de salida	Data odjazdu	Ημερομηνία αναχώρησης	Data plecării	Дата на заминаване	\N	Avgångsdatum	\N	Vertrekdatum
Contact	\N	Contact	Kontakt	Contatto	Contacto	Kontakt	Επικοινωνία	a lua legatura	контакт	\N	Kontakta	\N	Contact
Book Now	\N	Reserve maintenant	buchen Sie jetzt	Prenota ora	Reservar ahora	Rezerwuj teraz	Κάνετε κράτηση τώρα	Rezerva acum	Резервирайте сега	\N	Boka nu	\N	Boek nu
Royal Facilities	\N	Installations royales	Königliche Einrichtungen	Strutture reali	Instalaciones reales	Royal Facilities	Royal Facilities	Facilități regale	Кралски съоръжения	\N	Kungliga faciliteter	\N	Koninklijke voorzieningen
Blog Details	\N	Détails du blog	Blog Details	Dettagli del blog	Detalles del blog	Szczegóły bloga	Λεπτομέρειες ιστολογίου	Detalii despre blog	Подробности за блога	\N	Blogginformation	\N	Blogdetails
<i class="lnr lnr-shirt"></i>Swimming Pool	\N	<i class="lnr lnr-shirt"></i> Piscine	<i class="lnr lnr-shirt"></i> Schwimmbad	<i class="lnr lnr-shirt"></i> Piscina	<i class="lnr lnr-shirt"></i> Piscina	<i class="lnr lnr-shirt"></i> Basen	<i class="lnr lnr-shirt"></i> Πισίνα	<i class="lnr lnr-shirt"></i> Piscina	<i class="lnr lnr-shirt"></i> Басейн	\N	<i class="lnr lnr-shirt"></i> Simbassäng	\N	<i class="lnr lnr-shirt"></i> Zwembad
Low Cost Advertising	\N	Publicité à faible coût	Kostengünstige Werbung	Pubblicità a basso costo	Publicidad de bajo costo	Tania reklama	Διαφήμιση χαμηλού κόστους	Publicitate low cost	Реклама с ниска цена	\N	Låg kostnadsreklam	\N	Goedkoop adverteren
Feature	\N	Fonctionnalité	Merkmal	caratteristica	Característica	Cecha	χαρακτηριστικό	Caracteristică	Особеност	\N	Funktion	\N	Voorzien zijn van
Gallery	\N	Galerie	Galerie	Galleria	Galería	Galeria	Εκθεσιακός χώρος	Galerie	галерия	\N	Galleri	\N	Galerij
Double Deluxe Room	\N	Chambre Double Deluxe	Deluxe Doppelzimmer	Camera doppia deluxe	Habitación doble de lujo	Pokój Dwuosobowy typu Deluxe	Δίκλινο Deluxe Δωμάτιο	Cameră dublă Deluxe	Двойна стая Делукс	\N	Dubbelrum Deluxe	\N	Deluxe tweepersoonskamer
Hotel Accomodation	\N	Hébergement à l&#39;hôtel	Hotel Unterkunft	Sistemazione in hotel	Alojamiento de hotel	Zakwaterowanie w hotelu	Hotel Accomodation	Cazare la hotel	Настаняване в хотел	\N	Hotellboende	\N	Hotel accomodatie
Get Started	\N	Commencer	Loslegen	Iniziare	Empezar	Zaczynać	Ξεκίνα	Incepe	Първи стъпки	\N	Komma igång	\N	Begin
Book<br> Your Room	\N	Livre <br> Ta chambre	Buch <br> Ihr Zimmer	Libro <br> La vostra stanza	Libro <br> Tu cuarto	Książka <br> Twój pokój	Βιβλίο <br> Το δωμάτιό σου	Carte <br> Camera ta	Книга <br> Твоята стая	\N	bok <br> Ditt rum	\N	Boek <br> Jouw kamer
18:10	\N	18h10	18:10	\N	18:10	\N	\N	18:10	18:10	\N	18:10	\N	18:10
11:00	\N	11h00	11:00	11:00	11:00	\N	\N	11:00	11:00	\N	11:00	\N	11:00
Arrival Date	\N	Date d&#39;arrivée	Ankunftsdatum	Data d&#39;arrivo	Fecha de llegada	Data przybycia	Ημερομηνία άφιξης	Data sosirii	Дата на пристигане	\N	Ankomstdatum	\N	Aankomstdatum
18:20	\N	18h20	18:20	\N	18:20	\N	\N	18:20	18:20	\N	18:20	\N	18:20
5:00	\N	5h00	5:00	05:00	5:00	\N	\N	5:00	05:00	\N	05:00	\N	05:00
2010	\N	2010	2010	2010	2010	\N	\N	2010	2010	\N	2010	\N	2010
2016	\N	2016	2016	2016	2016	\N	\N	2016	2016	\N	2016	\N	2016
About Us <br>Our History<br>Mission &amp; Vision	\N	À propos de nous <br> Notre histoire <br> La vision de la mission	Über uns <br> Unsere Geschichte <br> Mission &amp; Vision	Riguardo a noi <br> La nostra storia <br> Visione della missione	Sobre nosotros <br> Nuestra historia <br> Misión Visión	O nas <br> Nasza historia <br> Misja i wizja	Σχετικά με εμάς <br> Η ιστορία μας <br> Αποστολή &amp; Όραμα	Despre noi <br> Istoria noastra <br> Misiunea și viziunea	За нас <br> Нашата история <br> Мисия и визия	\N	Om oss <br> Vår historia <br> Mission &amp; Vision	\N	Over ons <br> Onze geschiedenis <br> Missie visie
Aug	\N	Août	Aug.	agosto	ago	\N	\N	august	август	\N	Augusti	\N	augustus
next	\N	suivant	Nächster	Il prossimo	próximo	Kolejny	Επόμενο	Următor →	следващия	\N	Nästa	\N	volgende
15:00	\N	15h00	15:00	15:00	15:00	\N	\N	15:00	15:00	\N	15:00	\N	15:00
4:00	\N	4h00	4:00	04:00	4:00	\N	\N	04:00	04:00	\N	04:00	\N	04:00
18:35	\N	18h35	18:35	\N	18:35	\N	\N	18:35	18:35	\N	18:35	\N	18:35
We all live in an age that belongs to the young at heart. Life that is becoming extremely fast, 	\N	Nous vivons tous à une époque qui appartient aux jeunes de cœur. La vie qui devient extrêmement rapide,	Wir alle leben in einer Zeit, die den Junggebliebenen gehört. Leben, das extrem schnell wird,	Viviamo tutti in un&#39;età che appartiene ai giovani di cuore. La vita che sta diventando estremamente veloce,	Todos vivimos en una época que pertenece a los jóvenes de corazón. La vida se está volviendo extremadamente rápida,	Wszyscy żyjemy w wieku, który należy do młodych duchem. Życie, które staje się niezwykle szybkie,	Όλοι ζούμε σε μια εποχή που ανήκει στους νέους στην καρδιά. Η ζωή που γίνεται εξαιρετικά γρήγορη,	Cu toții trăim într-o epocă care aparține celor mici din suflet. Viața care devine extrem de rapidă,	Всички живеем във епоха, която принадлежи на младите по сърце. Живот, който става изключително бърз,	\N	Vi lever alla i en ålder som tillhör de unga i hjärtat. Livet som håller på att bli extremt snabbt,	\N	We leven allemaal in een tijdperk dat hoort bij de jongeren van hart. Leven dat extreem snel wordt,
Request Custom Price	\N	Demander un prix personnalisé	Benutzerdefinierten Preis anfordern	Richiedi un prezzo personalizzato	Solicitar precio personalizado	Poproś o cenę niestandardową	Ζητήστε την προσαρμοσμένη τιμή	Cereți preț personalizat	Поискайте персонализирана цена	\N	Begär anpassat pris	\N	Vraag aangepaste prijs aan
Pricing	\N	Prix	Preisgestaltung	Prezzi	Precios	cennik	Τιμολόγηση	Prețuri	Ценообразуване	\N	Prissättning	\N	pricing
The world has become so fast paced that people don’t want to stand by reading a page of information, they would much rather look at a presentation and understand the message. It has come to a point 	\N	Le monde est devenu si rapide que les gens ne veulent pas lire une page d&#39;informations, ils préfèrent regarder une présentation et comprendre le message. Il est arrivé à un point	Die Welt ist so schnelllebig geworden, dass die Menschen nicht länger eine Informationsseite lesen möchten, sondern lieber eine Präsentation ansehen und die Botschaft verstehen möchten. Es ist zu einem Punkt gekommen	Il mondo è diventato così veloce che la gente non vuole stare a leggere una pagina di informazioni, preferirebbe piuttosto guardare una presentazione e capire il messaggio. È arrivato al punto	El mundo se ha acelerado tanto que las personas no quieren quedarse leyendo una página de información, prefieren mirar una presentación y entender el mensaje. Ha llegado a un punto	\N	\N	Lumea a devenit atât de rapidă încât oamenii nu vor să stea citind o pagină de informații, mai degrabă ar privi mai degrabă o prezentare și să înțeleagă mesajul. S-a ajuns la un punct	Светът стана толкова бърз, че хората не искат да стоят, като четат страница с информация, по-скоро биха погледнали презентация и разберат съобщението. Стигна се до някакъв момент	\N	Världen har blivit så snabb att folk inte vill stå och läsa en informationssida, de vill hellre titta på en presentation och förstå meddelandet. Det har kommit till en punkt	\N	De wereld is zo snel geworden dat mensen niet willen blijven staan bij het lezen van een pagina met informatie, ze kijken liever naar een presentatie en begrijpen de boodschap. Het is zover gekomen
13:00	\N	13h00	13:00	13:00	13:00	\N	\N	13:00	13:00	\N	13:00	\N	13:00
Email Address	\N	Adresse électronique	E-Mail-Addresse	Indirizzo email	Dirección de correo electrónico	Adres e-mail	Διεύθυνση ηλεκτρονικού ταχυδρομείου	Adresa de email	Имейл адрес	\N	E-postadress	\N	E-mailadres
Team	\N	Équipe	Mannschaft	Squadra	Equipo	Zespół	Ομάδα	Echipă	екип	\N	Team	\N	Team
Nb Adults	\N	Nb Adultes	Nb Erwachsene	Nb adulti	Nb adultos	Liczba dorosłych	Nb Ενήλικες	Nb Adulti	Nb Възрастни	\N	Nb Vuxna	\N	Aantal volwassenen
Acres of Diamonds… you’ve read the famous story, or at least had it related to you. A farmer.	\N	Acres of Diamonds… vous avez lu la célèbre histoire, ou du moins l&#39;aviez-vous racontée. Un fermier.	Acres of Diamonds… Sie haben die berühmte Geschichte gelesen oder hatten zumindest einen Bezug zu Ihnen. Ein Bauer.	Acres of Diamonds ... hai letto la famosa storia, o almeno ce l&#39;hai legata. Un contadino.	Acres of Diamonds ... has leído la famosa historia, o al menos la has relacionado contigo. Un granjero.	Acres of Diamonds… przeczytałeś słynną historię, a przynajmniej miałeś z nią związek. Rolnik.	Acres of Diamonds ... έχετε διαβάσει τη διάσημη ιστορία ή τουλάχιστον σχετιζόταν με εσάς. Αγρότης.	Acres of Diamonds ... ai citit faimoasa poveste, sau cel puțin ai avut legătură cu tine. Un fermier.	Акра от диаманти ... прочетохте известната история или поне я свързахте с вас. Фермер.	\N	Acres of Diamonds ... du har läst den berömda historien, eller åtminstone haft den relaterad till dig. En bonde.	\N	Acres of Diamonds… je hebt het beroemde verhaal gelezen, of het had in ieder geval iets met jou te maken. Een boer.
16:00	\N	16h00	16:00	16:00	16:00	\N	\N	16:00	16:00	\N	16:00	\N	16:00
Feb	\N	fév	Februar	febbraio	feb	\N	\N	februarie	февруари	\N	februari	\N	februari
7:00	\N	7h00	7:00	07:00	7:00	\N	\N	07:00	07:00	\N	07:00	\N	07:00
Apr	\N	avr	Apr	aprile	abr	\N	\N	Aprilie	април	\N	april	\N	april
Testimonial from our Clients	\N	Témoignage de nos clients	Zeugnis von unseren Kunden	Testimonianza dei nostri clienti	Testimonio de nuestros clientes	Referencje od naszych klientów	Μαρτυρία από τους Πελάτες μας	Mărturie din partea clienților noștri	Препоръка от нашите клиенти	\N	Vittnesmål från våra kunder	\N	Getuigenis van onze klanten
Mar	\N	Mar	Beschädigen	mar	mar	\N	\N	strica	развалям	\N	mar	\N	bederven
Navigation Links	\N	Liens de navigation	Navigationslinks	Link di navigazione	Enlaces de navegación	Linki nawigacyjne	Σύνδεσμοι πλοήγησης	Link-uri de navigare	Навигационни връзки	\N	Navigeringslänkar	\N	Navigatielinks
inappropriate behavior is often laughed off as “boys will be boys,” women face higher conduct standards especially in the workplace. That’s why it’s crucial that, as women, our behavior on the job is beyond reproach. inappropriate behavior is often laughed.	\N	On se moque souvent des comportements inappropriés car «les garçons seront des garçons», les femmes sont soumises à des normes de conduite plus élevées, en particulier sur leur lieu de travail. C&#39;est pourquoi il est crucial qu&#39;en tant que femmes, notre comportement au travail soit irréprochable. comportement inapproprié est souvent ri.	unangemessenes Verhalten wird oft ausgelacht, da „Jungen Jungen sein werden“. Frauen sehen sich insbesondere am Arbeitsplatz höheren Verhaltensstandards gegenüber. Deshalb ist es entscheidend, dass unser Verhalten bei der Arbeit für Frauen über jeden Zweifel erhaben ist. unangemessenes Verhalten wird oft ausgelacht.	comportamenti inappropriati vengono spesso derisi poiché &quot;i ragazzi saranno ragazzi&quot;, le donne devono affrontare standard di condotta più elevati, soprattutto sul posto di lavoro. Ecco perché è fondamentale che, come donne, il nostro comportamento sul lavoro sia irreprensibile. il comportamento inappropriato viene spesso deriso.	El comportamiento inapropiado a menudo se ríe porque &quot;los niños serán niños&quot;, las mujeres enfrentan estándares de conducta más altos, especialmente en el lugar de trabajo. Por eso es crucial que, como mujeres, nuestro comportamiento en el trabajo esté más allá de cualquier reproche. El comportamiento inapropiado a menudo se ríe.	niewłaściwe zachowanie jest często wyśmiewane, ponieważ „chłopcy będą chłopcami”, kobiety napotykają wyższe standardy postępowania, szczególnie w miejscu pracy. Dlatego tak ważne jest, aby jako kobiety nasze zachowanie w pracy było bez zarzutu. niewłaściwe zachowanie jest często wyśmiewane.	η ακατάλληλη συμπεριφορά συχνά λυπάται γιατί «τα αγόρια θα είναι αγόρια», οι γυναίκες αντιμετωπίζουν υψηλότερα πρότυπα συμπεριφοράς, ιδίως στον εργασιακό χώρο. Αυτός είναι ο λόγος για τον οποίο είναι πολύ σημαντικό, όπως και οι γυναίκες, η συμπεριφορά μας στη δουλειά να είναι πέρα από την κατηγορία. η ακατάλληλη συμπεριφορά συχνά γέλασε.	comportamentul inadecvat este adesea râs deoarece „băieții vor fi băieți”, femeile se confruntă cu standarde de conduită mai ridicate, în special la locul de muncă. De aceea este crucial ca, în calitate de femei, comportamentul nostru la locul de muncă să fie dincolo de reproșuri. comportamentul neadecvat este adesea râs.	често се смее неподходящото поведение, тъй като „момчетата ще бъдат момчета“, жените са изправени пред по-високи стандарти на поведение, особено на работното място. Ето защо е изключително важно, като жени, нашето поведение в работата е извън укор. често се смее неподходящо поведение.	\N	Otillräckligt beteende skrattas ofta eftersom &quot;pojkar kommer att vara pojkar&quot;, kvinnor möter högre uppförandestandarder, särskilt på arbetsplatsen. Det är därför det är avgörande att vårt beteende på jobbet som kvinnor är överklagat. olämpligt beteende skrattas ofta.	\N	ongepast gedrag wordt vaak uitgelachen omdat &quot;jongens jongens zullen zijn&quot;, vrouwen worden geconfronteerd met hogere gedragsnormen, vooral op de werkplek. Daarom is het van cruciaal belang dat ons gedrag als vrouw onberispelijk is. ongepast gedrag wordt vaak uitgelachen.
<i class="lnr lnr-coffee-cup"></i>Bar	\N	<i class="lnr lnr-coffee-cup"></i> Bar	<i class="lnr lnr-coffee-cup"></i> Bar	<i class="lnr lnr-coffee-cup"></i> Bar	<i class="lnr lnr-coffee-cup"></i> Bar	<i class="lnr lnr-coffee-cup"></i> Bar	<i class="lnr lnr-coffee-cup"></i> Μπαρ	<i class="lnr lnr-coffee-cup"></i> Bar	<i class="lnr lnr-coffee-cup"></i> бар	\N	<i class="lnr lnr-coffee-cup"></i> Bar	\N	<i class="lnr lnr-coffee-cup"></i> Bar
18:25	\N	18h25	18:25	\N	18:25	\N	\N	18:25	18:25	\N	18:25	\N	18:25
Creative Outdoor Ads	\N	Annonces créatives en plein air	Kreative Außenwerbung	Annunci creativi all&#39;aperto	Anuncios creativos al aire libre	Kreatywne reklamy zewnętrzne	Δημιουργικές υπαίθριες διαφημίσεις	Anunțuri creative în aer liber	Творчески външни реклами	\N	Kreativa utomhusannonser	\N	Creatieve buitenadvertenties
31st January,2018	\N	31 janvier 2018	31. Januar 2018	31 gennaio 2018	31 de enero de 2018	31 stycznia 2018 r	31 Ιανουαρίου 2018	31 ianuarie 2018	31 януари 2018 г.	\N	31 januari 2018	\N	31 januari 2018
14:00	\N	14h00	14:00	14:00	14:00	\N	\N	14:00	14:00	\N	14:00	\N	14:00
18:55	\N	18h55	18:55	\N	18:55	\N	\N	18:55	18:55	\N	18:55	\N	18:55
It S Classified How To Utilize Free	\N	Il est classé comment utiliser gratuitement	Es ist klassifiziert, wie man kostenlos verwendet	È classificato come utilizzare gratuitamente	Está clasificado cómo utilizar gratis	To jest sklasyfikowane, jak korzystać bezpłatnie	Είναι S Classified Πώς να χρησιμοποιήσετε δωρεάν	Este clasificat modul de utilizare gratuit	Това е S класифицирано как да използвате безплатно	\N	Det klassificeras hur man använder gratis	\N	Het is geclassificeerd hoe gratis te gebruiken
2009	\N	2009	2009	2009	2009	\N	\N	2009	2009	\N	2009	\N	2009
The world has become so fast paced that people don’t want to stand by reading a page of information, they would much rather look at a presentation and\n                            understand the message. It has come to a point 	\N	Le monde est devenu si rapide que les gens ne veulent pas lire une page d&#39;informations, ils préfèrent regarder une présentation et comprendre le message. Il est arrivé à un point	Die Welt ist so schnelllebig geworden, dass die Menschen nicht länger eine Informationsseite lesen möchten, sondern lieber eine Präsentation ansehen und die Botschaft verstehen möchten. Es ist zu einem Punkt gekommen	Il mondo è diventato così veloce che la gente non vuole stare a leggere una pagina di informazioni, preferirebbe piuttosto guardare una presentazione e capire il messaggio. È arrivato al punto	El mundo se ha acelerado tanto que las personas no quieren quedarse leyendo una página de información, prefieren mirar una presentación y entender el mensaje. Ha llegado a un punto	Świat stał się tak szybki, że ludzie nie chcą stać, czytając stronę z informacjami, wolą raczej spojrzeć na prezentację i zrozumieć przesłanie. Doszło do punktu	Ο κόσμος έχει γίνει τόσο γρήγορος ρυθμός ώστε οι άνθρωποι δεν θέλουν να σταθούν διαβάζοντας μια σελίδα πληροφοριών, θα προτιμούσαν πολύ να δουν μια παρουσίαση και να καταλάβουν το μήνυμα. Έχει φτάσει σε ένα σημείο	Lumea a devenit atât de rapidă încât oamenii nu vor să stea citind o pagină de informații, mai degrabă ar privi mai degrabă o prezentare și să înțeleagă mesajul. S-a ajuns la un punct	Светът стана толкова бърз, че хората не искат да стоят, като четат страница с информация, по-скоро биха погледнали презентация и разберат съобщението. Стигна се до някакъв момент	\N	Världen har blivit så snabb att folk inte vill stå och läsa en informationssida, de vill hellre titta på en presentation och förstå meddelandet. Det har kommit till en punkt	\N	De wereld is zo snel geworden dat mensen niet willen blijven staan bij het lezen van een pagina met informatie, ze kijken liever naar een presentatie en begrijpen de boodschap. Het is zover gekomen
Single Deluxe Room	\N	Chambre Single Deluxe	Einzelzimmer Deluxe	Camera singola deluxe	Habitación individual de lujo	Pokój Jednoosobowy typu Deluxe	Μονόκλινο Deluxe Δωμάτιο	Cameră single Deluxe	Единична делукс стая	\N	Enkel Deluxe-rum	\N	Deluxe eenpersoonskamer
Self-doubt and fear interfere with our ability to achieve or set goals. Self-doubt and fear are	\N	Le doute de soi et la peur entravent notre capacité à atteindre ou à fixer des objectifs. Le doute de soi et la peur sont	Selbstzweifel und Angst beeinträchtigen unsere Fähigkeit, Ziele zu erreichen oder zu setzen. Selbstzweifel und Angst sind	Il dubbio e la paura interferiscono con la nostra capacità di raggiungere o fissare obiettivi. Lo sono il dubbio e la paura	La duda y el miedo interfieren con nuestra capacidad para lograr o establecer objetivos. La duda y el miedo son	Wątpienie i strach zakłócają naszą zdolność do osiągania lub wyznaczania celów. Wątpliwości i strach są	Η αυτοπεποίθηση και ο φόβος παρεμβαίνουν στην ικανότητά μας να επιτύχουμε ή να θέτουμε στόχους. Η αυτοπεποίθηση και ο φόβος είναι	Îndoiala de sine și frica interferează cu capacitatea noastră de a ne atinge sau de a ne fixa obiective. Indoiala de sine si frica sunt	Самосъмнението и страхът пречат на способността ни да постигаме или поставяме цели. Самосъмнението и страхът са	\N	Självtvivel och rädsla stör vår förmåga att uppnå eller sätta mål. Själv tvivel och rädsla är	\N	Twijfel over zichzelf en angst verstoren ons vermogen om doelen te bereiken of te stellen. Zelftwijfel en angst zijn
Life Style	\N	Mode de vie	Lebensstil	Stile di vita	Estilo de vida	Styl życia	ΤΡΟΠΟΣ ΖΩΗΣ	Mod de viata	Начин на живот	\N	Livsstil	\N	Levensstijl
Colorlib	\N	Colorlib	Colorlib	Colorlib	Colorlib	Colorlib	Colorlib	Colorlib	Colorlib	\N	Colorlib	\N	Colorlib
22:00	\N	22h00	22:00	22:00	22:00	\N	\N	22:00	22:00	\N	22:00	\N	22:00
6:00	\N	6h00	6:00	06:00	6:00	\N	\N	06:00	06:00	\N	06:00	\N	06:00
2013	\N	2013	2013	2013	2013	\N	\N	2013	2013	\N	2013	\N	2013
<i class="lnr lnr-bicycle"></i>Sports CLub	\N	<i class="lnr lnr-bicycle"></i> Club de sport	<i class="lnr lnr-bicycle"></i> Sportclub	<i class="lnr lnr-bicycle"></i> Club sportivo	<i class="lnr lnr-bicycle"></i> Club de Deportes	<i class="lnr lnr-bicycle"></i> Klub Sportowy	<i class="lnr lnr-bicycle"></i> Αθλητικός όμιλος	<i class="lnr lnr-bicycle"></i> Club sportiv	<i class="lnr lnr-bicycle"></i> Спортен клуб	\N	<i class="lnr lnr-bicycle"></i> Sportklubb	\N	<i class="lnr lnr-bicycle"></i> Sportclub
Booking	\N	Réservation	Buchung	Prenotazione	Reserva	Rezerwować	Κράτηση	Rezervare	резервация	\N	Bokning	\N	Booking
As conscious traveling Paupers we must always be concerned about our dear Mother Earth. If you think about it, you travel across her face, and She is the 	\N	En tant que voyageurs conscients, nous devons toujours nous préoccuper de notre chère Mère Terre. Si vous y réfléchissez, vous traversez son visage et elle est la	Als bewusst reisende Paupers müssen wir uns immer Sorgen um unsere liebe Mutter Erde machen. Wenn du darüber nachdenkst, reist du über ihr Gesicht und sie ist die	Come poveri coscienti che viaggiano, dobbiamo sempre preoccuparci della nostra cara Madre Terra. Se ci pensate, le attraversate il viso e lei è la	Como mendigos viajeros conscientes, siempre debemos preocuparnos por nuestra querida Madre Tierra. Si lo piensas, viajas por su cara, y Ella es la	Jako świadomi podróżujący nędznicy musimy zawsze martwić się o naszą drogą Matkę Ziemię. Jeśli się nad tym zastanowisz, podróżujesz po jej twarzy, a ona jest tą	Ως συνειδητοί Ταξιδιώτες, πρέπει πάντα να ανησυχούμε για τη αγαπητή μας Μητέρα Γη. Εάν το σκέφτεστε, ταξιδεύετε απέναντι στο πρόσωπό της και αυτή είναι η	În calitate de Pașteri călători conștienți, trebuie să fim mereu preocupați de draga noastră mamă Pământ. Dacă te gândești la asta, călătorești pe fața ei, iar ea este	Като съзнателни пътуващи палавници винаги трябва да сме загрижени за нашата скъпа Майка Земя. Ако се замислите, пътувате през нейното лице и тя е тази	\N	Som medvetna resande Paupers måste vi alltid vara bekymrade över vår kära Moder Jord. Om du tänker på det reser du över hennes ansikte och hon är den	\N	Als bewuste reizende Paupers moeten we ons altijd zorgen maken over onze geliefde Moeder Aarde. Als je erover nadenkt, reis je over haar gezicht en zij is de
Services	\N	Prestations de service	Dienstleistungen	Servizi	Servicios	Usługi	Υπηρεσίες	Servicii	Услуги	\N	tjänster	\N	Diensten
Jul	\N	juil	Jul	luglio	jul	\N	\N	iulie	юли	\N	juli	\N	juli
Jan	\N	Jan	Jan	Jan	ene	\N	\N	Jan	Jan	\N	jan	\N	jan
Home	\N	Accueil	Zuhause	Casa	Casa	Dom	Σπίτι	Acasă	У дома	\N	Hem	\N	Huis
17:00	\N	17h00	17:00	17:00	17:00	\N	\N	17:00	17:00	\N	17:00	\N	17:00
Portfolio	\N	Portefeuille	Portfolio	Portafoglio	portafolio	Teczka	Χαρτοφυλάκιο	Portofoliu	Портфолио	\N	Portfölj	\N	Portefeuille
Honeymoon Suit	\N	Costume de lune de miel	Flitterwochen-Anzug	Abito da luna di miele	Traje de luna de miel	Kombinezon dla nowożeńców	Στολή νεόνυμφων	Costum de luna de miere	Костюм за меден месец	\N	Bröllopsresa	\N	Huwelijksreis Suit
Who are in extremely love with eco friendly system.	\N	Qui sont extrêmement amoureux du système écologique.	Wer sind extrem verliebt in umweltfreundliche System.	Chi è estremamente innamorato del sistema eco-compatibile.	Quienes están extremadamente enamorados del sistema ecológico.	Którzy są wyjątkowo zakochani w systemie przyjaznym dla środowiska.	Ποιοι είναι σε εξαιρετικά αγάπη με φιλικό προς το περιβάλλον σύστημα.	Cei care sunt extrem de îndrăgostiți de un sistem ecologic.	Които са изключително влюбени в екологичната система.	\N	Som är mycket kär i miljövänliga system.	\N	Die extreem verliefd zijn op een milieuvriendelijk systeem.
18:15	\N	18h15	18:15	\N	18:15	\N	\N	18:15	18:15	\N	18:15	\N	18:15
21:00	\N	21h00	21:00	21:00	21:00	\N	\N	21:00	21:00	\N	21:00	\N	21:00
Adult	\N	Adulte	Erwachsene	Adulto	Adulto	\N	\N	Adult	възрастен	\N	Vuxen	\N	Volwassen
Usage of the Internet is becoming more common due to rapid advancement of technology and power.	\N	L&#39;utilisation d&#39;Internet devient de plus en plus courante en raison des progrès rapides de la technologie et du pouvoir.	Die Nutzung des Internets wird aufgrund des raschen Fortschritts von Technologie und Leistung immer häufiger.	L&#39;uso di Internet sta diventando più comune a causa del rapido progresso della tecnologia e del potere.	El uso de Internet se está volviendo más común debido al rápido avance de la tecnología y el poder.	Korzystanie z Internetu staje się coraz powszechniejsze ze względu na szybki postęp technologii i mocy.	Η χρήση του Διαδικτύου γίνεται όλο και πιο κοινή λόγω της ταχείας εξέλιξης της τεχνολογίας και της εξουσίας.	Utilizarea Internetului devine din ce în ce mai frecventă datorită avansării rapide a tehnologiei și a puterii.	Използването на интернет става все по-често поради бързото развитие на технологиите и мощността.	\N	Användning av Internet blir allt vanligare på grund av snabb utveckling av teknik och kraft.	\N	Gebruik van internet wordt steeds gebruikelijker vanwege de snelle vooruitgang van technologie en kracht.
0:00	\N	0:00	0:00	00:00	0:00	\N	\N	0:00	0:00	\N	00:00	\N	00:00
2012	\N	2012	2012	2012	2012	\N	\N	2012	2012	\N	2012	\N	2012
Nb Rooms	\N	Nb Chambres	Nb Zimmer	Nb Rooms	Nb habitaciones	Pokoje Nb	Nb Rooms	Camere Nb	Nb стаи	\N	Nb Rum	\N	Aantal kamers
9:00	\N	9h00	9:00	09:00	9:00	\N	\N	09:00	09:00	\N	09:00	\N	09:00
10:00	\N	10h00	10:00	10:00	10:00	\N	\N	10:00	10:00	\N	10:00	\N	10:00
2:00	\N	2:00	2:00	02:00	2:00	\N	\N	2:00	02:00	\N	02:00	\N	02:00
Jun	\N	Juin	Jun	giugno	jun	\N	\N	Iunie	юни	\N	juni	\N	juni
latest posts from blog	\N	derniers articles du blog	Neueste Beiträge aus dem Blog	ultimi post dal blog	últimas publicaciones del blog	najnowsze posty z bloga	τις τελευταίες αναρτήσεις από το blog	ultimele postări de pe blog	последните публикации от блога	\N	senaste inlägg från bloggen	\N	laatste berichten van blog
18:30	\N	18h30	18:30	\N	18:30	\N	\N	18:30	18:30	\N	18:30	\N	18:30
Away from monotonous life	\N	Loin de la vie monotone	Weg vom eintönigen Leben	Lontano dalla vita monotona	Lejos de la vida monótona	Z dala od monotonne życie	Μακριά από μονότονη ζωή	Departe de viața monotonă	Далеч от монотонен живот	\N	Bort från monotont liv	\N	Weg van het monotone leven
If you are looking at blank cassettes on the web, you may be very confused at the<br> difference in price. You may see some for as low as $.17 each.	\N	Si vous consultez des cassettes vierges sur le Web, vous risquez d&#39;être très confus au <br> différence de prix. Vous en verrez peut-être pour aussi peu que 0,17 $ chacun.	Wenn Sie leere Kassetten im Web betrachten, sind Sie möglicherweise sehr verwirrt über die <br> Preisunterschied. Sie können einige für so niedrig wie $ .17 pro Stück sehen.	Se stai guardando cassette vuote sul web, potresti essere molto confuso su <br> differenza di prezzo. Potresti vederne alcuni a partire da $ .17 ciascuno.	Si está mirando cassettes en blanco en la web, puede estar muy confundido con el <br> diferencia de precio Puede ver algunos por tan solo $ .17 cada uno.	Jeśli patrzysz na puste kasety w sieci, możesz być bardzo zdezorientowany <br> różnica w cenie. Możesz zobaczyć niektóre już za 0,17 $ każdy.	Εάν κοιτάζετε κενές κασέτες στο διαδίκτυο, μπορεί να είστε πολύ συγκεχυμένοι στο <br> διαφορά τιμής. Μπορεί να δείτε μερικά τόσο χαμηλά όπως $ .17 το καθένα.	Dacă te uiți la casete goale de pe web, s-ar putea să fii foarte confuz la adresa <br> diferență de preț. Este posibil să vedeți unele cu prețuri de până la $ 17 fiecare.	Ако търсите празни касети в интернет, може да сте много объркани в <br> разлика в цената. Може да видите някои само за .17 долара.	\N	Om du tittar på tomma kassetter på webben kan du bli väldigt förvirrad på <br> skillnad i pris. Du kan se några för så låga som $ 0,17 vardera.	\N	Als u lege cassettes op internet bekijkt, kunt u erg in de war raken over de <br> verschil in prijs. Mogelijk ziet u sommige voor slechts $ 0,17 per stuk.
1:00	\N	1h00	1:00	01:00	1:00	\N	\N	1:00	01:00	\N	01:00	\N	01:00
23:00	\N	23h00	23:00	23:00	23:00	\N	\N	23:00	23:00	\N	23:00	\N	23:00
Travel	\N	Voyage	Reise	Viaggio	Viajar	Podróżować	Ταξίδι	Călătorie	пътуване	\N	Resa	\N	Reizen
19:00	\N	19h00	19:00	19:00	19:00	\N	\N	19:00	19:00	\N	19:00	\N	19:00
3:00	\N	15h00	3:00	03:00	3:00	\N	\N	3:00	03:00	\N	03:00	\N	03:00
2019	\N	2019	2019	2019	2019	\N	\N	2019	2019	\N	2019	\N	2019
prev	\N	prev	vorh	prev	prev	poprz	prev	prev	предишна	\N	prev	\N	prev
<i class="lnr lnr-construction"></i>Gymnesium	\N	<i class="lnr lnr-construction"></i> Gymnase	<i class="lnr lnr-construction"></i> Turnhalle	<i class="lnr lnr-construction"></i> Gymnesium	<i class="lnr lnr-construction"></i> Gymnesium	<i class="lnr lnr-construction"></i> Gymnesium	<i class="lnr lnr-construction"></i> Γυμνόζη	<i class="lnr lnr-construction"></i> Gymnesium	<i class="lnr lnr-construction"></i> Gymnesium	\N	<i class="lnr lnr-construction"></i> Gymnesium	\N	<i class="lnr lnr-construction"></i> Gymnesium
8:00	\N	8h00	8:00	08:00	8:00	\N	\N	8:00	08:00	\N	08:00	\N	08:00
Relax Your Mind	\N	Détends ton esprit	Entspanne deinen Verstand	Rilassati	Relaja tu mente	Rozluźnij swój umysł	Χαλάρωσε	Relaxeaza-ti mintea	Отпуснете ума си	\N	Slappna av i hjärnan	\N	Ontspan je geest
About Agency	\N	A propos de l&#39;agence	Über die Agentur	Informazioni sull&#39;agenzia	Acerca de Agencia	O agencji	Σχετικά με τον Οργανισμό	Despre agenție	За Агенцията	\N	Om byrån	\N	Over Agentschap
18:40	\N	18h40	18:40	\N	18:40	\N	\N	18:40	18:40	\N	18:40	\N	18:40
Newsletter	\N	Bulletin	Newsletter	notiziario	Hoja informativa	Biuletyn	Ενημερωτικό δελτίο	Buletin informativ	Newsletter	\N	Nyhetsbrev	\N	Nieuwsbrief
18:50	\N	18h50	18:50	\N	18:50	\N	\N	18:50	18:50	\N	18:50	\N	18:50
InstaFeed	\N	InstaFeed	InstaFeed	InstaFeed	InstaFeed	InstaFeed	InstaFeed	InstaFeed	InstaFeed	\N	InstaFeed	\N	InstaFeed
<i class="lnr lnr-dinner"></i>Restaurant	\N	<i class="lnr lnr-dinner"></i> Restaurant	<i class="lnr lnr-dinner"></i> Restaurant	<i class="lnr lnr-dinner"></i> Ristorante	<i class="lnr lnr-dinner"></i> Restaurante	<i class="lnr lnr-dinner"></i> Restauracja	<i class="lnr lnr-dinner"></i> Εστιατόριο	<i class="lnr lnr-dinner"></i> Restaurant	<i class="lnr lnr-dinner"></i> Ресторант	\N	<i class="lnr lnr-dinner"></i> Restaurang	\N	<i class="lnr lnr-dinner"></i> Restaurant
Accomodation	\N	Hébergement	Unterkunft	Alloggio	Alojamiento	\N	\N	Cazare	Настаняване	\N	boende	\N	Accomodation
The French Revolution constituted for the conscience of the dominant aristocratic class a fall from 	\N	La Révolution française a constitué pour la conscience de la classe aristocratique dominante une chute de	Die Französische Revolution bildete für das Gewissen der herrschenden Adelsschicht einen Sturz aus	La rivoluzione francese costituì una caduta per la coscienza della classe aristocratica dominante	La Revolución Francesa constituyó para la conciencia de la clase aristocrática dominante una caída de	Rewolucja Francuska stanowiła dla sumienia dominującej klasy arystokratycznej upadek	Η Γαλλική Επανάσταση αποτελούσε πτώση για τη συνείδηση της κυρίαρχης αριστοκρατικής τάξης	Revoluția franceză a constituit pentru conștiința clasei aristocratice dominante o cădere din	Френската революция представлява спад на съвестта на доминиращата аристократична класа	\N	Den franska revolutionen utgjorde för samvete för den dominerande aristokratiska klassen ett fall från	\N	De Franse revolutie vormde een val voor het geweten van de dominante aristocratische klasse
For business professionals caught between high OEM price and mediocre print and graphic output, 	\N	Pour les professionnels, pris entre le prix OEM élevé et une impression médiocre et une impression graphique,	Für Geschäftsleute, die zwischen hohen OEM-Preisen und mittelmäßiger Druck- und Grafikausgabe schwanken,	Per i professionisti interessati a prezzi OEM elevati e stampa e grafica mediocri,	Para los profesionales de negocios atrapados entre el alto precio del OEM y la impresión mediocre y la producción gráfica,	Dla profesjonalistów stojących pomiędzy wysoką ceną OEM a miernym drukiem i wydajnością graficzną,	Για τους επαγγελματίες των επιχειρήσεων που αλιεύονται μεταξύ υψηλής τιμής ΚΑΕ και μέτρια εκτύπωση και γραφική παράδοση,	Pentru profesioniștii din afaceri prins între prețul OEM ridicat și imprimarea mediocră și producția grafică,	За бизнес професионалисти, уловени между висока OEM цена и посредствен печат и графичен изход,	\N	För affärspersoner fångade mellan högt OEM-pris och medioker tryck och grafisk produktion,	\N	Voor zakelijke professionals gevangen tussen een hoge OEM-prijs en middelmatige print en grafische uitvoer,
18:05	\N	18h05	18.05	\N	18:05	\N	\N	18:05	18:05	\N	18:05	\N	18:05
12:00	\N	12h00	12:00	00:00	12:00	\N	\N	12:00	12:00	\N	00:00	\N	00:00
Why do you want to motivate yourself? Actually, just answering that question fully can 	\N	Pourquoi voulez-vous vous motiver? En fait, le simple fait de répondre à cette question peut	Warum willst du dich motivieren? Eigentlich kann nur die vollständige Beantwortung dieser Frage	Perché vuoi motivarti? In realtà, basta rispondere a questa domanda pienamente	¿Por qué quieres motivarte? En realidad, solo responder esa pregunta completamente puede	Dlaczego chcesz się zmotywować? Właściwie to wystarczy odpowiedzieć na to pytanie w pełni	Γιατί θέλετε να παρακινήσετε τον εαυτό σας; Στην πραγματικότητα, απλά απαντώντας σε αυτό το ερώτημα μπορεί να γίνει	De ce vrei să te motivezi? De fapt, poate răspunde la această întrebare pe deplin	Защо искате да се мотивирате? Всъщност просто отговорът на този въпрос може	\N	Varför vill du motivera dig själv? Det är faktiskt bara att besvara den frågan fullt ut	\N	Waarom wil je jezelf motiveren? Eigenlijk kan alleen die vraag volledig beantwoorden
<i class="lnr lnr-car"></i>Rent a Car	\N	<i class="lnr lnr-car"></i> Louer une voiture	<i class="lnr lnr-car"></i> Autovermietungen	<i class="lnr lnr-car"></i> Affittare una macchina	<i class="lnr lnr-car"></i> Alquilar un coche	<i class="lnr lnr-car"></i> Wypożyczyć auto	<i class="lnr lnr-car"></i> Νοικιάσετε ένα αυτοκίνητο	<i class="lnr lnr-car"></i> Închiriază o mașină	<i class="lnr lnr-car"></i> Коли под наем	\N	<i class="lnr lnr-car"></i> Hyra en bil	\N	<i class="lnr lnr-car"></i> Huur een auto
2020	\N	2020	2020	2020	2020	\N	\N	2020	2020	\N	2020	\N	2020
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
AppCategory~~Business Administration
AppCategory~~Booking & Appointments
AppCategory~~Maintenance & Support
AppCategory~~Design & Media
AppCategory~~Medical & Health
AppCategory~~Startup Management
AppCategory~~Consulting
AppCategory~~Sports & Fitness
AppCategory~~Food & Travel
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
SampleApp~~180 Real estate agency/broker	Real estate agency/broker	AppCategory~~Consulting		AppCategory~~Consulting	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~180 Real estate agency/broker')	Properties, contracts, testimonials	0.00000	\N	assets/images/90-south.png
SampleApp~~190 Financial Advisers	Financial Advisers	AppCategory~~Consulting		AppCategory~~Consulting	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~190 Financial Advisers')	Presentation website, customers portfolio, testimonials, paperless financial documents	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~200 Law Firm	Law Firm	AppCategory~~Consulting		AppCategory~~Consulting	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~200 Law Firm')	Contracts/documents, portfolio, testimonials, appointments	0.00000	\N	assets/images/44-law.png
SampleApp~~210 Barber shop	Barber shop	AppCategory~~Booking & Appointments		AppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~210 Barber shop')	Appointments, Galery, Showcase, Supplies/Beauty products, Services, Prices	0.00000	\N	assets/images/72-razor.png
SampleApp~~220 Beauty Salon	Beauty Salon	AppCategory~~Booking & Appointments		AppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~220 Beauty Salon')	Appointments, Galery, Showcase, Supplies/Beauty products, Services, Prices	0.00000	\N	assets/images/beauty.jpg
SampleApp~~230 Spa	Spa	AppCategory~~Booking & Appointments		AppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~230 Spa')	Galery, Appointmens, services	0.00000	\N	assets/images/spa.jpg
SampleApp~~240 Bike store and service	Bike store and service	AppCategory~~Booking & Appointments	AppCategory~~Maintenance & Support	AppCategory~~Booking & AppointmentsAppCategory~~Maintenance & Support	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~240 Bike store and service')	Galery, online store, service appointments&status	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~250 Water sports	Water sports	AppCategory~~Sports & Fitness		AppCategory~~Sports & Fitness	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~250 Water sports')	Scuba, Jet ski, Paddleboard, Kiting Galery, testimonials, bookings	0.00000	\N	assets/images/water_sports_3.jpg
SampleApp~~260 Gym	Gym	AppCategory~~Sports & Fitness		AppCategory~~Sports & Fitness	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~260 Gym')	Galery, trainers, class appointments, members	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~270 Trainer/Educator	Trainer/Educator	AppCategory~~Booking & Appointments		AppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~270 Trainer/Educator')	Presentation website, classes, bookings	0.00000	\N	assets/images/74-ezuca.png
SampleApp~~280 Team planning	Team planning	AppCategory~~Startup Management	AppCategory~~Business Administration	AppCategory~~Startup ManagementAppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~280 Team planning')	Members, activities, boards, milestones	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~290 Business Plan	Business Plan	AppCategory~~Startup Management	AppCategory~~Business Administration	AppCategory~~Startup ManagementAppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~290 Business Plan')	Forecasts, cash flow, team, projects	0.00000	\N	assets/images/65-businessbox.png
SampleApp~~300 Business Model Canvas	Business Model Canvas	AppCategory~~Startup Management	AppCategory~~Business Administration	AppCategory~~Startup ManagementAppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~300 Business Model Canvas')	Key Activities, partners, key resources, channels, costs, revenues, customer segmentation	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~310 Value Proposition Canvas	Value Proposition Canvas	AppCategory~~Startup Management	AppCategory~~Business Administration	AppCategory~~Startup ManagementAppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~310 Value Proposition Canvas')	Products&services, gain creators, pain relevers,job to be done	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~320 HR Recruit	HR Recruit	AppCategory~~Human Resources	AppCategory~~Business Administration	AppCategory~~Human ResourcesAppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~320 HR Recruit')	Profiles, Job openings, Interview Appointments	0.00000	\N	assets/images/25-job-listing.png
SampleApp~~330 Restaurant	Restaurant	AppCategory~~Food & Travel		AppCategory~~Food & Travel	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~330 Restaurant')	Presentation, Galery, Reservations, Menu, Events	0.00000	\N	assets/images/42-taste.png
SampleApp~~340 HR Processes	HR Processes	AppCategory~~Human Resources	AppCategory~~Business Administration	AppCategory~~Human ResourcesAppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~340 HR Processes')	Timesheet, Training, Leave, Conference Room Booking	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~350 Social Media Management	Social Media Management	AppCategory~~Startup Management	AppCategory~~Business Administration	AppCategory~~Startup ManagementAppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~350 Social Media Management')	Channels, Scheduals, Keywords, Analytics	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~360 Online Store	Online Store	AppCategory~~E-Commerce		AppCategory~~E-Commerce	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~360 Online Store')	Orders, inventory, payments, shipping, showcase, and analytics	0.00000	\N	assets/images/3-watch.png
SampleApp~~370 Event Planning	Event Planning	AppCategory~~Booking & Appointments		AppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~370 Event Planning')	Attendies, speakers, topics, scheduals,presentation	0.00000	\N	assets/images/67-the-real-wedding.png
SampleApp~~380 Insurance Broker	Insurance Broker	AppCategory~~Consulting		AppCategory~~Consulting	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~380 Insurance Broker')	Comparative Offers, Claims, Payments, Settlements,Customers, Policies, Presentation	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~390 Helpdesk	Helpdesk	AppCategory~~Maintenance & Support		AppCategory~~Maintenance & Support	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~390 Helpdesk')	Tickets, Reports,Forms, 	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~400 Credit Broker	Credit Broker	AppCategory~~Consulting		AppCategory~~Consulting	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~400 Credit Broker')	Comparative Offers, Credit Products, Customers, Policies, Presentation	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~410 Playground	Playground	AppCategory~~Booking & Appointments		AppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~410 Playground')	Presentation, Galery, Reservations, Menu, Events	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~420 Project Tracking	Project Tracking	AppCategory~~Business Administration		AppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~420 Project Tracking')	Projects, Tasks, Team Members, Clients	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~430 Legal case management	Legal case management	AppCategory~~Business Administration		AppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~430 Legal case management')	Users, Clients, Cases, Tasks, Documents, Resources	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~440 Shopping/Packing Lists	Shopping/Packing Lists	AppCategory~~Personal	AppCategory~~Home & Family	AppCategory~~PersonalAppCategory~~Home & Family	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~440 Shopping/Packing Lists')		0.00000	\N	assets/images/under-construction.jpg
SampleApp~~450 CV/ Resume	CV/ Resume	AppCategory~~Personal		AppCategory~~Personal	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~450 CV/ Resume')	Profiles, Portofolio, Presentation	0.00000	\N	assets/images/98-profile.png
SampleApp~~460 Survey	Survey	AppCategory~~Human Resources	AppCategory~~Business Administration	AppCategory~~Human ResourcesAppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~460 Survey')		0.00000	\N	assets/images/under-construction.jpg
SampleApp~~470 Art Gallery	Art Gallery	AppCategory~~Food & Travel	AppCategory~~Booking & Appointments	AppCategory~~Food & TravelAppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~470 Art Gallery')	Tickets, shop, gallery, presentation, workshops	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~480 Museum	Museum	AppCategory~~Food & Travel	AppCategory~~Booking & Appointments	AppCategory~~Food & TravelAppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~480 Museum')		0.00000	\N	assets/images/under-construction.jpg
SampleApp~~490 Exhibition area	Exhibition area	AppCategory~~Food & Travel	AppCategory~~Booking & Appointments	AppCategory~~Food & TravelAppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~490 Exhibition area')		0.00000	\N	assets/images/under-construction.jpg
SampleApp~~500 Theater	Theater	AppCategory~~Food & Travel	AppCategory~~Booking & Appointments	AppCategory~~Food & TravelAppCategory~~Booking & Appointments	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~500 Theater')		0.00000	\N	assets/images/under-construction.jpg
SampleApp~~510 Basic Warehouse	Basic Warehouse	AppCategory~~Business Administration		AppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~510 Basic Warehouse')	Warehouses, Products, Product Locations, Shipment Tracking Numbers	0.00000	\N	assets/images/under-construction.jpg
SampleApp~~520 Users and Roles	Users and Roles	AppCategory~~Business Administration		AppCategory~~Business Administration	javascript:$MODAL('add__WishListRequest.html', 'SampleApp~~520 Users and Roles')	Users, Roles, Applications, Permissions, Single-sign-on for all apps	0.00000	\N	assets/images/under-construction.jpg
\.


--
-- Data for Name: ttransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ttransaction (_id, val) FROM stdin;
1570880681457_msyg34adYeQGwB65NHXdJV	{"clientId_":"6an6F9q5KdWXFMNUV49Cco","state_":"ABORT","obj":{"_id":"ProductLocation~~1__1","product_id":"InventoryProduct~~1","location_code":"Warehouse1","category":"C1","price":123.5,"received_stock__":0,"ordered_stock__":10,"available_stock__":-10},"type_":"ServerEventModifiedFormData","_id":"1570880681457_msyg34adYeQGwB65NHXdJV","reason_":"ABORTED_FAILED_VALIDATIONS_RETRIES_EXCEEDED","error_":"Failed Validations: ProductLocation!positiveStock"}
1570880681683_eqMsU42RyufLAYKRq7YKNd	{"clientId_":"6qwz4MzFzdDrLyz9aZyywh","state_":"ABORT","obj":{"_id":"ProductLocation~~1__1a","product_id":"InventoryProduct~~1a","location_code":"Warehouse1","category":"C1","price":1.5,"received_stock__":0,"ordered_stock__":4,"available_stock__":-4},"type_":"ServerEventModifiedFormData","_id":"1570880681683_eqMsU42RyufLAYKRq7YKNd","reason_":"ABORTED_FAILED_VALIDATIONS_RETRIES_EXCEEDED","error_":"Failed Validations: ProductLocation!positiveStock"}
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

