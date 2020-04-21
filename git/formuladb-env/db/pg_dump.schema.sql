--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Debian 11.7-2.pgdg90+1)
-- Dumped by pg_dump version 12.2

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
-- Name: f_12628; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_12628 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_12628 OWNER TO postgres;

--
-- Name: f_15108; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_15108 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_15108 OWNER TO postgres;

--
-- Name: f_6592; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_6592 (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.f_6592 OWNER TO postgres;

--
-- Name: t_currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.t_currency (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    code character varying
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
-- Name: t_system_param; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.t_system_param (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    name character varying,
    value character varying
);


ALTER TABLE public.t_system_param OWNER TO postgres;

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
    _id character varying NOT NULL COLLATE pg_catalog."C",
    guiorder character varying,
    _owner character varying,
    _role character varying,
    _rev character varying
);


ALTER TABLE public.tappcategory OWNER TO postgres;

--
-- Name: tcontactrequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tcontactrequest (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    email character varying,
    comments character varying,
    _owner character varying,
    _role character varying,
    _rev character varying
);


ALTER TABLE public.tcontactrequest OWNER TO postgres;

--
-- Name: trestaurant_menu_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trestaurant_menu_item (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    _owner character varying,
    _role character varying,
    _rev character varying,
    name character varying,
    picture character varying,
    description character varying,
    price numeric(12,5)
);


ALTER TABLE public.trestaurant_menu_item OWNER TO postgres;

--
-- Name: trestaurant_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trestaurant_order (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    _owner character varying,
    _role character varying,
    _rev character varying,
    email character varying,
    phone character varying,
    delivery_address character varying,
    total numeric(12,5)
);


ALTER TABLE public.trestaurant_order OWNER TO postgres;

--
-- Name: trestaurant_order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trestaurant_order_item (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    _owner character varying,
    _role character varying,
    _rev character varying,
    restaurant_order character varying,
    menu_item character varying,
    quantity numeric(12,5),
    price numeric(12,5),
    item_cost numeric(12,5)
);


ALTER TABLE public.trestaurant_order_item OWNER TO postgres;

--
-- Name: troom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.troom (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    nb numeric(12,5),
    room_type character varying,
    _owner character varying,
    _role character varying,
    _rev character varying
);


ALTER TABLE public.troom OWNER TO postgres;

--
-- Name: troom_booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.troom_booking (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    guest character varying,
    room_type character varying,
    start_date character varying,
    end_date character varying,
    nb_adults numeric(12,5),
    nb_children numeric(12,5),
    days numeric(12,5),
    cost numeric(12,5),
    _owner character varying,
    _role character varying,
    _rev character varying,
    room_type_name character varying,
    price character varying
);


ALTER TABLE public.troom_booking OWNER TO postgres;

--
-- Name: troom_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.troom_type (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    name character varying,
    description character varying,
    picture character varying,
    long_description character varying,
    price numeric(12,5),
    wifi character varying,
    parking character varying,
    total_number_of_rooms numeric(12,5),
    _owner character varying,
    _role character varying,
    _rev character varying
);


ALTER TABLE public.troom_type OWNER TO postgres;

--
-- Name: tsampleapp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tsampleapp (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    category character varying,
    category2 character varying,
    categories character varying,
    app_url character varying,
    short_description character varying,
    wish_list_count numeric(12,5),
    status character varying,
    call_to_action character varying,
    small_img character varying,
    long_img character varying,
    guiorder character varying,
    _owner character varying,
    _role character varying,
    _rev character varying
);


ALTER TABLE public.tsampleapp OWNER TO postgres;

--
-- Name: tvaggs_room_countif_room__room_type_______id___reduce; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tvaggs_room_countif_room__room_type_______id___reduce (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.tvaggs_room_countif_room__room_type_______id___reduce OWNER TO postgres;

--
-- Name: tvobs_room_type_countif_room__room_type_______id___map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tvobs_room_type_countif_room__room_type_______id___map (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    val json
);


ALTER TABLE public.tvobs_room_type_countif_room__room_type_______id___map OWNER TO postgres;

--
-- Name: twishlistrequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twishlistrequest (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    app character varying,
    email character varying,
    comments character varying,
    _owner character varying,
    _role character varying,
    _rev character varying
);


ALTER TABLE public.twishlistrequest OWNER TO postgres;

--
-- Name: f_12628 f_12628_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_12628
    ADD CONSTRAINT f_12628_pkey PRIMARY KEY (_id);


--
-- Name: f_15108 f_15108_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_15108
    ADD CONSTRAINT f_15108_pkey PRIMARY KEY (_id);


--
-- Name: f_6592 f_6592_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.f_6592
    ADD CONSTRAINT f_6592_pkey PRIMARY KEY (_id);


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
-- Name: t_system_param t_system_param_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.t_system_param
    ADD CONSTRAINT t_system_param_pkey PRIMARY KEY (_id);


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
-- Name: tcontactrequest tcontactrequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tcontactrequest
    ADD CONSTRAINT tcontactrequest_pkey PRIMARY KEY (_id);


--
-- Name: trestaurant_menu_item trestaurant_menu_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trestaurant_menu_item
    ADD CONSTRAINT trestaurant_menu_item_pkey PRIMARY KEY (_id);


--
-- Name: trestaurant_order_item trestaurant_order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trestaurant_order_item
    ADD CONSTRAINT trestaurant_order_item_pkey PRIMARY KEY (_id);


--
-- Name: trestaurant_order trestaurant_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trestaurant_order
    ADD CONSTRAINT trestaurant_order_pkey PRIMARY KEY (_id);


--
-- Name: troom_booking troom_booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.troom_booking
    ADD CONSTRAINT troom_booking_pkey PRIMARY KEY (_id);


--
-- Name: troom troom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.troom
    ADD CONSTRAINT troom_pkey PRIMARY KEY (_id);


--
-- Name: troom_type troom_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.troom_type
    ADD CONSTRAINT troom_type_pkey PRIMARY KEY (_id);


--
-- Name: tsampleapp tsampleapp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tsampleapp
    ADD CONSTRAINT tsampleapp_pkey PRIMARY KEY (_id);


--
-- Name: tvaggs_room_countif_room__room_type_______id___reduce tvaggs_room_countif_room__room_type_______id___reduce_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tvaggs_room_countif_room__room_type_______id___reduce
    ADD CONSTRAINT tvaggs_room_countif_room__room_type_______id___reduce_pkey PRIMARY KEY (_id);


--
-- Name: tvobs_room_type_countif_room__room_type_______id___map tvobs_room_type_countif_room__room_type_______id___map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tvobs_room_type_countif_room__room_type_______id___map
    ADD CONSTRAINT tvobs_room_type_countif_room__room_type_______id___map_pkey PRIMARY KEY (_id);


--
-- Name: twishlistrequest twishlistrequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twishlistrequest
    ADD CONSTRAINT twishlistrequest_pkey PRIMARY KEY (_id);


--
-- PostgreSQL database dump complete
--

