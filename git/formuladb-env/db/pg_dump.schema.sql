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
-- Name: t_currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.t_currency (
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
-- Name: troom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.troom (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    nb numeric(12,5),
    room_type character varying
);


ALTER TABLE public.troom OWNER TO postgres;

--
-- Name: troombooking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.troombooking (
    _id character varying NOT NULL COLLATE pg_catalog."C",
    guest character varying,
    room_type character varying,
    start_date character varying,
    end_date character varying,
    nb_adults numeric(12,5),
    nb_children numeric(12,5),
    days numeric(12,5),
    cost character varying,
    total_number_of_rooms character varying,
    number_of_booked_rooms numeric(12,5),
    number_of_available_rooms numeric(12,5)
);


ALTER TABLE public.troombooking OWNER TO postgres;

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
    parking character varying,
    total_number_of_rooms numeric(12,5)
);


ALTER TABLE public.troomtype OWNER TO postgres;

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
-- Name: troom troom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.troom
    ADD CONSTRAINT troom_pkey PRIMARY KEY (_id);


--
-- Name: troombooking troombooking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.troombooking
    ADD CONSTRAINT troombooking_pkey PRIMARY KEY (_id);


--
-- Name: troomtype troomtype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.troomtype
    ADD CONSTRAINT troomtype_pkey PRIMARY KEY (_id);


--
-- PostgreSQL database dump complete
--

