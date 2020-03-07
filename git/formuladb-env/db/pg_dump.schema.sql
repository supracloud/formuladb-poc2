--
-- PostgreSQL database dump
--

-- Dumped from database version 11.6 (Debian 11.6-1.pgdg90+1)
-- Dumped by pg_dump version 12.1

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
-- Name: t_icon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.t_icon (
    _id character varying NOT NULL COLLATE pg_catalog."C"
);


ALTER TABLE public.t_icon OWNER TO postgres;

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
    status character varying,
    call_to_action character varying,
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
-- Name: t_icon t_icon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.t_icon
    ADD CONSTRAINT t_icon_pkey PRIMARY KEY (_id);


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

