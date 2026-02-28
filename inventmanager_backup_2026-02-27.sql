--
-- PostgreSQL database dump
--

\restrict hX8sOPXZPQJo2hGnUdgYl5HMUv6fc1KvFyX8bqpOvLneoLKwXi2FqIBrVu2fa50

-- Dumped from database version 17.7 (Ubuntu 17.7-0ubuntu0.25.04.1)
-- Dumped by pg_dump version 17.7 (Ubuntu 17.7-0ubuntu0.25.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ExpenseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExpenseType" AS ENUM (
    'RENT',
    'UTILITIES',
    'SALARIES',
    'COMMISSION',
    'SUPPLIES',
    'MARKETING',
    'TRANSPORTATION',
    'MAINTENANCE',
    'INSURANCE',
    'TAXES',
    'OTHER'
);


ALTER TYPE public."ExpenseType" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'BANK_TRANSFER',
    'CREDIT'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'SALES'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: StockAdjustmentReason; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StockAdjustmentReason" AS ENUM (
    'DAMAGE',
    'THEFT',
    'GIFT',
    'CORRECTION',
    'COUNT_ERROR',
    'EXPIRED',
    'RETURNED',
    'OTHER'
);


ALTER TYPE public."StockAdjustmentReason" OWNER TO postgres;

--
-- Name: StockEntryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StockEntryStatus" AS ENUM (
    'FULLY_PAID',
    'PARTIALLY_PAID',
    'ON_CREDIT'
);


ALTER TYPE public."StockEntryStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _StockEntryToSupplierPayment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_StockEntryToSupplierPayment" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_StockEntryToSupplierPayment" OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id text NOT NULL,
    name text NOT NULL,
    phone text,
    address text,
    credit_limit numeric(12,2) DEFAULT 0 NOT NULL,
    current_balance numeric(12,2) DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    notes text,
    visible_to_sales boolean DEFAULT true NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: daily_opening_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_opening_balances (
    id text NOT NULL,
    date date NOT NULL,
    amount numeric(12,2) NOT NULL,
    notes text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.daily_opening_balances OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    expense_type public."ExpenseType" NOT NULL,
    expense_date date NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "paymentMethod" text NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "bankType" character varying(255),
    "bankTransferImageUrl" character varying(500),
    "customPaymentNote" character varying(500)
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: payments_received; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments_received (
    id text NOT NULL,
    company_id text NOT NULL,
    sale_id text,
    amount numeric(12,2) NOT NULL,
    method public."PaymentMethod" NOT NULL,
    salesperson_id text NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payments_received OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    code text,
    category text,
    unit text,
    pieces_per_unit integer DEFAULT 1 NOT NULL,
    cost_price numeric(12,2) DEFAULT 0 NOT NULL,
    selling_price numeric(12,2) DEFAULT 0 NOT NULL,
    low_stock_alert integer DEFAULT 10 NOT NULL,
    stock_qty integer DEFAULT 0 NOT NULL,
    notes text,
    description text,
    image_url text,
    show_on_website boolean DEFAULT false NOT NULL,
    is_new boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: public_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.public_products (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    image_url text,
    price numeric(12,2),
    category text,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.public_products OWNER TO postgres;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id text NOT NULL,
    sale_id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    sale_unit text DEFAULT 'pieces'::text,
    admin_price numeric(12,2) NOT NULL,
    overridden_price numeric(12,2),
    final_price numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    surplus_amount numeric(12,2) DEFAULT 0,
    admin_cut_amount numeric(12,2) DEFAULT 0,
    admin_cut_percentage numeric(5,2),
    remaining_surplus numeric(12,2) DEFAULT 0,
    salesperson_gets_commission boolean DEFAULT false NOT NULL,
    salesperson_commission_amount numeric(12,2) DEFAULT 0,
    salesperson_commission_percentage numeric(5,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id text NOT NULL,
    invoice_number text NOT NULL,
    company_id text,
    walkin_name text,
    walkin_phone text,
    subtotal numeric(12,2) NOT NULL,
    vat_amount numeric(12,2) DEFAULT 0 NOT NULL,
    tot_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    total_paid numeric(12,2) DEFAULT 0 NOT NULL,
    total_credit numeric(12,2) DEFAULT 0 NOT NULL,
    commission_amount numeric(12,2) DEFAULT 0 NOT NULL,
    bank_type text,
    salesperson_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    bank_transfer_image_url text
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by text
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_adjustments (
    id text NOT NULL,
    product_id text NOT NULL,
    qty_change integer NOT NULL,
    reason public."StockAdjustmentReason" NOT NULL,
    notes text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stock_adjustments OWNER TO postgres;

--
-- Name: stock_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_entries (
    id text NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    cost_price numeric(12,2) NOT NULL,
    batch_number text,
    expiry_date date,
    supplier_name text NOT NULL,
    status public."StockEntryStatus" DEFAULT 'FULLY_PAID'::public."StockEntryStatus" NOT NULL,
    owed_amount numeric(12,2) DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stock_entries OWNER TO postgres;

--
-- Name: supplier_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_payments (
    id text NOT NULL,
    stock_entry_ids text[],
    amount numeric(12,2) NOT NULL,
    method public."PaymentMethod" NOT NULL,
    supplier_name text NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.supplier_payments OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public."Role" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    total_commission numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: website_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.website_settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by text
);


ALTER TABLE public.website_settings OWNER TO postgres;

--
-- Data for Name: _StockEntryToSupplierPayment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_StockEntryToSupplierPayment" ("A", "B") FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, phone, address, credit_limit, current_balance, notes, created_at, updated_at) FROM stdin;
6ac242d7-7b05-46e9-95a0-9640cfa2b078	test			1000000.00	1150.00	\N	2026-01-04 06:51:10.568	2026-02-24 10:43:25.463
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, name, phone, notes, visible_to_sales, created_by, created_at, updated_at) FROM stdin;
cdc5b503-cbf5-4ee3-8222-d40c8981b70a	dfhdsajkfa	0921973022	\N	t	6df92a47-912a-4b89-a47b-6086b5c1ebab	2026-01-04 07:56:46.308	2026-01-04 07:56:46.308
\.


--
-- Data for Name: daily_opening_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_opening_balances (id, date, amount, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, expense_type, expense_date, description, amount, "paymentMethod", created_by, created_at, updated_at, "bankType", "bankTransferImageUrl", "customPaymentNote") FROM stdin;
9c608021-3ae5-4ba6-883f-02c604ca3696	OTHER	2026-02-23	7.5% and 3%	3000.00	CASH	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-23 14:12:45.379	2026-02-23 14:12:45.379	\N	\N	\N
5579badc-0bf1-4bf9-88c3-14ef7f6cf303	OTHER	2026-02-23	7.5% and 3%	3000.00	CASH	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-23 14:12:47.644	2026-02-23 14:12:47.644	\N	\N	\N
82120510-7e86-414e-a341-b3009233ffae	OTHER	2026-02-24	Test	10000.00	CASH	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-24 10:45:22.991	2026-02-24 10:45:22.991	\N	\N	\N
b7518695-a6ee-40dc-8a66-83b3ee46c368	OTHER	2026-02-24	Test second	1795.00	CASH	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-24 10:46:53.382	2026-02-24 10:46:53.382	\N	\N	\N
d4e3d3ee-0b52-4017-8d74-d64d8d06ceca	OTHER	2026-02-24	test payment 	1.00	BANK_TRANSFER	aeb4f2de-3876-42c0-a7fc-5e529d1f6006	2026-02-24 14:42:19.718	2026-02-24 14:42:19.718	CBE	\N	\N
fa41f477-3ab6-4c88-b3d6-7e9c4f8fb317	OTHER	2026-02-25	Test 	100.00	OTHER	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-25 11:12:12.709	2026-02-25 11:12:12.709	\N	\N	Test
b854e83e-a2df-48c1-a099-4d6f1facfd52	OTHER	2026-02-27	Test	500.00	CASH	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 08:15:10.624	2026-02-27 08:15:10.624	\N	\N	\N
a8a638f0-b283-402a-acb4-136a878f7303	OTHER	2026-02-27	Test 2	1000.00	CASH	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 08:16:05.979	2026-02-27 08:16:05.979	\N	\N	\N
758f344a-429e-4bec-b465-7a6ce317a81c	OTHER	2026-02-27	uhfodsjf	1.00	CASH	a7db893e-3fcb-40e7-afa8-02d0a0bf6561	2026-02-27 08:40:02.964	2026-02-27 08:40:02.964	\N	\N	\N
3d16c0fe-1d66-4c34-b054-c198362fdfa5	OTHER	2026-02-27	ajdbiajdf	1.00	BANK_TRANSFER	a7db893e-3fcb-40e7-afa8-02d0a0bf6561	2026-02-27 08:40:15.683	2026-02-27 08:40:15.683	CBE	\N	\N
56a5b150-2cb6-4000-b77d-039b788d78d6	OTHER	2026-02-27	test	1.00	BANK_TRANSFER	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 09:08:19.862	2026-02-27 09:08:19.862	TELEBIRR	\N	\N
\.


--
-- Data for Name: payments_received; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments_received (id, company_id, sale_id, amount, method, salesperson_id, notes, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, code, category, unit, pieces_per_unit, cost_price, selling_price, low_stock_alert, stock_qty, notes, description, image_url, show_on_website, is_new, created_at, updated_at) FROM stdin;
83bb0106-0ba3-481e-ac9a-29fbc2880529	CCTV Camera 4Mp	\N	Networking Accessories	pcs	1	16445.00	18445.00	10	5	\N	\N	\N	f	f	2026-02-05 08:40:43.337	2026-02-05 08:40:43.337
7be95056-f629-48c7-ba8f-b32fc1ebb924	Photo copy Machine Canon 2224n	photo-copy-machine-canon-2224n	Machinery	pcs	1	135000.00	155250.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.44	2026-02-02 10:32:45.44
dbcbbe5a-bec2-44cf-a13a-e10404c9877c	Hp Laser Jet 135W	hp-laser-jet-135w	Machinery	pcs	1	43000.00	49450.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.45	2026-02-02 10:32:45.45
478ef94a-3611-4452-a758-4ae6b8249e72	Canon printor 3010	canon-printor-3010	Machinery	pcs	1	48000.00	55200.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.455	2026-02-02 10:32:45.455
e65ab140-7118-4630-a8fc-d671c2c221d2	Hp Lasre jet 130Fn	hp-lasre-jet-130fn	Machinery	pcs	1	45000.00	51750.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.459	2026-02-02 10:32:45.459
dbbfdd4b-d0c0-420f-baee-26ad50187877	canon 2411 printer	canon-2411-printer	Machinery	pcs	1	34000.00	39100.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.463	2026-02-02 10:32:45.463
052184a3-61ca-43db-8fa7-c5d5b2e8a123	Epson Color Printer L3210	epson-color-printer-l3210	Machinery	pcs	1	34000.00	39100.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.467	2026-02-02 10:32:45.467
56609f75-847c-41ae-b07c-e011b6272e4a	hp laser jet printer 107a	hp-laser-jet-printer-107a	Machinery	pcs	1	26500.00	30475.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.471	2026-02-02 10:32:45.471
e6da5876-a86f-4b42-a501-5dddeddde250	hp laser jet printer 4003dn	hp-laser-jet-printer-4003dn	Machinery	pcs	1	46000.00	52900.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.481	2026-02-02 10:32:45.481
9a0c2d86-741f-40df-a2fb-0ba56d30a2c0	Hp laser Jet 404dn used	hp-laser-jet-404dn-used	Machinery	pcs	1	36500.00	41975.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.486	2026-02-02 10:32:45.486
3b454b32-6d4d-4afc-a08e-26d8d833dd59	Binding Machine S 100	binding-machine-s-100	Machinery	pcs	1	16500.00	18975.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.489	2026-02-02 10:32:45.489
1ec3c656-8322-4e19-9d7c-637a17a4cf35	Binding Machine 8621	binding-machine-8621	Machinery	pcs	1	6500.00	7475.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.491	2026-02-02 10:32:45.491
d4d59ce0-236d-4120-9c3c-16673a22162a	Kyocera Prinetr 2040dn	kyocera-prinetr-2040dn	Machinery	pcs	1	39000.00	44850.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.494	2026-02-02 10:32:45.494
e93d3b8c-c126-4c72-bfc9-564b1001b266	Laminating machen A3	laminating-machen-a3	Machinery	pcs	1	7500.00	8625.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.497	2026-02-02 10:32:45.497
101aca97-3da1-4702-b517-a27e9c1103fc	Tv Smart Super Fine 43 Inch	tv-smart-super-fine-43-inch	Machinery	pcs	1	39000.00	44850.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.5	2026-02-02 10:32:45.5
c02f3793-8815-4cb3-96ff-6b066fc40dce	GPS-72 h	gps-72-h	Machinery	pcs	1	9000.00	10350.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.503	2026-02-02 10:32:45.503
e2256fbe-7153-44c8-9c7a-2bb09dc92cbd	Mini LCD Projectr	mini-lcd-projectr	Machinery	pcs	1	4500.00	5175.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.506	2026-02-02 10:32:45.506
2e453bd5-8e0e-4db4-8b0a-e356e809247b	Wifi Wirrless Projector	wifi-wirrless-projector	Machinery	pcs	1	10900.00	12535.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.509	2026-02-02 10:32:45.509
264d70ca-1b6c-492b-a9f7-f3ab0373badb	Handy came camera sony	handy-came-camera-sony	Machinery	pcs	1	8500.00	9775.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.512	2026-02-02 10:32:45.512
6dd7a731-ef6a-42cd-b942-0ba432d11900	Handy came camera canon	handy-came-camera-canon	Machinery	pcs	1	11500.00	13225.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.515	2026-02-02 10:32:45.515
d6c50df9-7b20-4a62-92b5-6855507cfc4b	HP Scan jet 2600f1	hp-scan-jet-2600f1	Machinery	pcs	1	63000.00	72450.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.518	2026-02-02 10:32:45.518
5a0656f8-74fa-4061-a332-0ec493e3cf25	Canon 300 scanner	canon-300-scanner	Machinery	pcs	1	24000.00	27600.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.52	2026-02-02 10:32:45.52
f2ef5a1a-1c1b-45d1-98bd-68096ae135be	Thermal Printer	thermal-printer	Machinery	pcs	1	13000.00	14950.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.523	2026-02-02 10:32:45.523
b387593a-55fc-4324-a2b1-8c5485493fbf	UPS Turbo Smart 1500VA	ups-turbo-smart-1500va	Machinery	pcs	1	26500.00	30475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.525	2026-02-02 10:32:45.525
4ebe1ff5-9162-44d5-be74-56febe940c8e	UPS Intex Mision 1500VA	ups-intex-mision-1500va	Machinery	pcs	1	24500.00	28175.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.528	2026-02-02 10:32:45.528
4bd750dc-6c89-43ed-87ba-58e0f35f2abe	UPS Intex Smart 1500VA	ups-intex-smart-1500va	Machinery	pcs	1	25500.00	29325.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.531	2026-02-02 10:32:45.531
87970c5d-26ce-4ed3-975a-fd2b80a558b2	UPS smart 650VA	ups-smart-650va	Machinery	pcs	1	16500.00	18975.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.534	2026-02-02 10:32:45.534
dd7112a8-6f35-4aea-bca9-6998deaef76e	CANON 2420 dram unit	canon-2420-dram-unit	Machinery	pcs	1	2200.00	2530.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.537	2026-02-02 10:32:45.537
c6e1619e-f3b8-46c1-96a9-524a5da00175	Hp laptop Used cor i5 12 gen 8/512 15.6 inch Pavilion	hp-laptop-used-cor-i5-12-gen-8-512-15-6-inch-pavilion	Machinery	pcs	1	103000.00	118450.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.539	2026-02-02 10:32:45.539
41e05bb4-9f41-401f-a8db-bd43e9a4b5d6	hp laptop cur i7 10th 8/512sd 14 inch	hp-laptop-cur-i7-10th-8-512sd-14-inch	Machinery	pcs	1	60000.00	69000.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.542	2026-02-02 10:32:45.542
db9a6f5f-6a3f-4d6a-9584-e4aedb948760	Hp desktop coputer cori5 used	hp-desktop-coputer-cori5-used	Machinery	pcs	1	30500.00	35075.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.545	2026-02-02 10:32:45.545
ed9bf4d1-eb7e-4b7f-ba26-79a6a90da07d	Hp laptop Cori7 11th Gen 8/512 14inch	hp-laptop-cori7-11th-gen-8-512-14inch	Machinery	pcs	1	95000.00	109250.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.548	2026-02-02 10:32:45.548
7485bd80-7386-4f25-825e-f99fdaa12ec8	VGA Cable	vga-cable	Computer Accessories	pcs	1	150.00	173.00	10	54	\N	\N	\N	t	f	2026-02-02 10:32:45.551	2026-02-02 10:32:45.551
56c7b70b-9ab1-4bdc-a993-f698f3606e4e	power cable Desk top	power-cable-desk-top	Computer Accessories	pcs	1	130.00	150.00	10	73	\N	\N	\N	t	f	2026-02-02 10:32:45.554	2026-02-02 10:32:45.554
06f1b41f-ef9a-46e7-9261-5c07188db9b2	power cable laptop	power-cable-laptop	Computer Accessories	pcs	1	180.00	207.00	10	31	\N	\N	\N	t	f	2026-02-02 10:32:45.556	2026-02-02 10:32:45.556
3e0f4a24-34bc-4904-af9f-78c7f4bb9c7b	Jack Cable	jack-cable	Computer Accessories	pcs	1	60.00	69.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:45.559	2026-02-02 10:32:45.559
4b653b5b-894e-4e51-9834-010bfa0c7a95	Mic Cable	mic-cable	Computer Accessories	pcs	1	200.00	230.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.561	2026-02-02 10:32:45.561
37ca753c-6d1a-452e-9877-e8ac5b2064b5	CRYSTAL Computer tool kit 56pcs	crystal-computer-tool-kit-56pcs	Computer Accessories	pcs	1	13000.00	14950.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.564	2026-02-02 10:32:45.564
8897ff16-7bef-4ce0-bae5-ad8f4c207576	Poso Mentenance tool kit	poso-mentenance-tool-kit	Computer Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.566	2026-02-02 10:32:45.566
2468af3c-880a-4a89-b370-f1bfc247e5fb	Telephone box	telephone-box	Computer Accessories	pcs	1	4000.00	4600.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.569	2026-02-02 10:32:45.569
883f79f6-97ba-43b2-a71d-d8878afb4af1	Laptop HDD 1TB Internal	laptop-hdd-1tb-internal	Computer Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:45.574	2026-02-02 10:32:45.574
a58b4a07-4a86-4e7a-afe3-e964060aeb2f	Laptop HDD 500GB Internal	laptop-hdd-500gb-internal	Computer Accessories	pcs	1	3500.00	4025.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.575	2026-02-02 10:32:45.575
d3d1b5a6-a5e2-45f4-a661-82f515311aaf	External DVD-RW Drive	external-dvd-rw-drive	Computer Accessories	pcs	1	3000.00	3450.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.578	2026-02-02 10:32:45.578
4b032f94-8cf0-4961-a615-8bd4a5576caf	Laptop screen 10"	laptop-screen-10	Computer Accessories	pcs	1	650.00	748.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.58	2026-02-02 10:32:45.58
2116a26c-11f2-4002-b144-e8b92a164a12	Internal DvD Room	internal-dvd-room	Computer Accessories	pcs	1	900.00	1035.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.583	2026-02-02 10:32:45.583
ef3c4053-e14e-4ab0-9388-de28b4ccc1e6	internal DVD-RW Desktop	internal-dvd-rw-desktop	Computer Accessories	pcs	1	1800.00	2070.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.587	2026-02-02 10:32:45.587
6ec23840-09f6-4799-b60f-0a3217fb6644	Laptop screen 15.6 altera slim 40pin	laptop-screen-15-6-altera-slim-40pin	Computer Accessories	pcs	1	6500.00	7475.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.589	2026-02-02 10:32:45.589
60397b10-f717-45a4-8075-61e3d1927454	Laptop Screen 15.6 LED 40pin	laptop-screen-15-6-led-40pin	Computer Accessories	pcs	1	6500.00	7475.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.592	2026-02-02 10:32:45.592
e665e1bf-3092-4810-b920-67035c7bdeef	Laptop adapter Assess	laptop-adapter-assess	Computer Accessories	pcs	1	1200.00	1380.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.595	2026-02-02 10:32:45.595
c2268fc8-f9b3-4eae-aab3-10ff70852562	Phone charger A type	phone-charger-a-type	Computer Accessories	pcs	1	500.00	575.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.598	2026-02-02 10:32:45.598
9b346d68-a8b1-400f-9cf3-c298ae5b8736	Phone charger C type	phone-charger-c-type	Computer Accessories	pcs	1	550.00	633.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.601	2026-02-02 10:32:45.601
6540d728-6e67-46e7-9ea9-ce87c32a6594	Blower Rwodel Large	Blower Rwodel Large	Computer Accessories	pcs	1	6900.00	8500.00	10	2		\N	\N	t	f	2026-02-02 10:32:45.632	2026-02-27 12:22:09.374
2a094433-fac8-4d7d-8209-71155d105e21	Laptop adapter lenevo	laptop-adapter-lenevo	Computer Accessories	pcs	1	1400.00	1610.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.603	2026-02-02 10:32:45.603
f85346b9-b46f-46b7-94da-1c3e2e9dc573	Laptop adapter toshiba	laptop-adapter-toshiba	Computer Accessories	pcs	1	1400.00	1610.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:45.606	2026-02-02 10:32:45.606
e90b925d-1912-4113-85cb-a27a285c4dba	Laptop adapter Dell	laptop-adapter-dell	Computer Accessories	pcs	1	1600.00	1840.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.608	2026-02-02 10:32:45.608
769d8554-1f34-4945-86d6-13dc8390195d	Laptop adapter hp	laptop-adapter-hp	Computer Accessories	pcs	1	1600.00	1840.00	10	10	\N	\N	\N	t	f	2026-02-02 10:32:45.611	2026-02-02 10:32:45.611
a5a5c9ab-646b-4143-9b01-83e9c635e43c	Laptop Adpter Orginal Lenevo	laptop-adpter-orginal-lenevo	Computer Accessories	pcs	1	3000.00	3450.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.613	2026-02-02 10:32:45.613
7c926635-d262-4abf-9cfa-f7ef88ab106d	Laptop Adapter Orginal Hp	laptop-adapter-orginal-hp	Computer Accessories	pcs	1	2650.00	3048.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.616	2026-02-02 10:32:45.616
39197aa0-f95e-41bd-9e5f-27bfd67290f5	Laptop Adapter Orginal TO	laptop-adapter-orginal-to	Computer Accessories	pcs	1	2650.00	3048.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.619	2026-02-02 10:32:45.619
b4510fa1-88ba-433e-9b17-1f07facdbddf	External ssd Case 2.5	external-ssd-case-2-5	Computer Accessories	pcs	1	2300.00	2645.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.621	2026-02-02 10:32:45.621
9c2ea417-f251-45d7-8898-7ea585fc6c0a	Internal HDD Case	internal-hdd-case	Computer Accessories	pcs	1	800.00	920.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.624	2026-02-02 10:32:45.624
f11b373f-ee3e-45b0-a287-102efd9b4247	Scanner Adapter	scanner-adapter	Computer Accessories	pcs	1	5000.00	5750.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.627	2026-02-02 10:32:45.627
fc784d45-9a96-4cb9-b1a0-a84f9961e6dd	Felash Duale c- type 32	felash-duale-c-type-32	Computer Accessories	pcs	1	1050.00	1208.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.635	2026-02-02 10:32:45.635
0fa4870b-39d7-4012-8468-1635241c20d7	Felash Duale 32GB	felash-duale-32gb	Computer Accessories	pcs	1	1050.00	1208.00	10	10	\N	\N	\N	t	f	2026-02-02 10:32:45.638	2026-02-02 10:32:45.638
1c01234c-c78f-49f5-b71d-00757dd2ad64	Felash Duale 64GB	felash-duale-64gb	Computer Accessories	pcs	1	1050.00	1208.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:45.641	2026-02-02 10:32:45.641
80fd0db3-0f3d-485d-b475-24853ae1c1f2	Camera memory 64GB	camera-memory-64gb	Computer Accessories	pcs	1	1400.00	1610.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:45.644	2026-02-02 10:32:45.644
bc3bdf82-e498-496b-8f93-509600f777d6	Mobile/ Camera memory 128gb	mobile-camera-memory-128gb	Computer Accessories	pcs	1	1840.00	2116.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.647	2026-02-02 10:32:45.647
3dee2ecd-c0d3-4faa-9bba-4aeaf101265d	Camera memory 32gb	camera-memory-32gb	Computer Accessories	pcs	1	1000.00	1150.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:45.649	2026-02-02 10:32:45.649
fa5623a8-4833-43a1-83e7-11d43458addc	Flash 128Gb sun disk	flash-128gb-sun-disk	Computer Accessories	pcs	1	1400.00	1610.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.652	2026-02-02 10:32:45.652
50a3f0d0-b182-4c54-8a61-366968bbbbb4	Flash32GB san disk	flash32gb-san-disk	Computer Accessories	pcs	1	635.00	730.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.655	2026-02-02 10:32:45.655
35a5650c-3a29-43c8-a9ed-0535ac97432f	Camera memory 128gb	camera-memory-128gb	Computer Accessories	pcs	1	2300.00	2645.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.658	2026-02-02 10:32:45.658
f6645c38-0eab-44a4-9f7e-94163add7fdf	usb to RS232 conveertor	usb-to-rs232-conveertor	Computer Accessories	pcs	1	750.00	863.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.66	2026-02-02 10:32:45.66
9809ac40-aab4-4082-a6d9-627eb48a82cd	Usb To Serial	usb-to-serial	Computer Accessories	pcs	1	750.00	863.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.663	2026-02-02 10:32:45.663
4368e387-8e69-49a9-a213-acb184077df9	C-Type To 8 in 1 Adapter	c-type-to-8-in-1-adapter	Computer Accessories	pcs	1	1265.00	1455.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.666	2026-02-02 10:32:45.666
cf805b1b-8c62-42a8-9f76-823fdebc1e87	C-Type To 11 in 1 Adapter	c-type-to-11-in-1-adapter	Computer Accessories	pcs	1	2650.00	3048.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.669	2026-02-02 10:32:45.669
188f8869-b6f1-45a0-9a4a-609009857fc2	C-Type To 4 in 1 Adapter	c-type-to-4-in-1-adapter	Computer Accessories	pcs	1	2600.00	2990.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.672	2026-02-02 10:32:45.672
33c0caca-2994-4f16-a47d-2a394e68be1f	Mini display port to HDMI adapter	mini-display-port-to-hdmi-adapter	Computer Accessories	pcs	1	920.00	1058.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:45.675	2026-02-02 10:32:45.675
7d63c4c8-84c8-4374-8bfa-cc372819703f	USB to VGA CONVERTOR	usb-to-vga-convertor	Computer Accessories	pcs	1	870.00	1001.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.677	2026-02-02 10:32:45.677
ec19e637-d42e-4ae7-be1b-697c33c4df3e	USB TO HDMI Covertor	usb-to-hdmi-covertor	Computer Accessories	pcs	1	870.00	1001.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.68	2026-02-02 10:32:45.68
59942ccb-165f-45b7-9687-245c8385982c	Mini Dsplay Port Adpter	mini-dsplay-port-adpter	Computer Accessories	pcs	1	800.00	920.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:45.682	2026-02-02 10:32:45.682
a8ddc429-7c98-41bc-8e92-bdbb919afd3f	Display Port to hdmi Adpter	display-port-to-hdmi-adpter	Computer Accessories	pcs	1	870.00	1001.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.685	2026-02-02 10:32:45.685
f0585807-fd4c-44f0-8904-aae94f82000c	VGA to HDMI	vga-to-hdmi	Computer Accessories	pcs	1	630.00	725.00	10	14	\N	\N	\N	t	f	2026-02-02 10:32:45.688	2026-02-02 10:32:45.688
f607370c-998d-4426-ab8e-0ffcb8f0b210	HDMI toVGA with Audio Convertor Pcs	hdmi-tovga-with-audio-convertor-pcs	Computer Accessories	pcs	1	650.00	748.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.691	2026-02-02 10:32:45.691
e72bfa00-70e4-4749-af10-2acfc7bf5d8a	Dp to VGA	dp-to-vga	Computer Accessories	pcs	1	860.00	989.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.694	2026-02-02 10:32:45.694
dc9c137e-acf9-469d-9879-1850ed407ad3	Dp to Dp	dp-to-dp	Computer Accessories	pcs	1	870.00	1001.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.696	2026-02-02 10:32:45.696
ad03515c-6c46-473f-b156-96efbe31ff97	HDMI TO VGA Convertor	hdmi-to-vga-convertor	Computer Accessories	pcs	1	650.00	748.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.699	2026-02-02 10:32:45.699
9aa1fce9-6cf5-47f9-a9e4-7a2c39b09e5a	USB HABE 7port 3.0	usb-habe-7port-3-0	Computer Accessories	pcs	1	1350.00	1553.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.702	2026-02-02 10:32:45.702
055bd0ac-9826-4c89-8c13-2f54e63802f4	USB Hub 4port 2.0	usb-hub-4port-2-0	Computer Accessories	pcs	1	1000.00	1150.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.705	2026-02-02 10:32:45.705
e4786f8c-e1a7-4ca7-bbcd-a20871a4a636	HDMI Cable 20m	hdmi-cable-20m	Computer Accessories	pcs	1	2650.00	3048.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.707	2026-02-02 10:32:45.707
af78379f-6430-4f9f-881d-f49091c53f2f	HDMI Cable 10m	hdmi-cable-10m	Computer Accessories	pcs	1	1500.00	1725.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.71	2026-02-02 10:32:45.71
7e9234a9-15e5-4728-9b61-1fccef1191ab	HDMI Cable 5m	hdmi-cable-5m	Computer Accessories	pcs	1	630.00	725.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.713	2026-02-02 10:32:45.713
68bd76dd-7845-4e5d-a073-dee980a4a4c2	HDMI to jack cable	hdmi-to-jack-cable	Computer Accessories	pcs	1	2000.00	2300.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.716	2026-02-02 10:32:45.716
873bde2b-c296-4fbb-98b5-f1a1af4a0cef	HDMI Cable 1.5m	hdmi-cable-1-5m	Computer Accessories	pcs	1	180.00	207.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.718	2026-02-02 10:32:45.718
6f1ce60d-2308-4838-a3c2-8514ac5f2087	USB printer cable 1.5	usb-printer-cable-1-5	Computer Accessories	pcs	1	200.00	230.00	10	15	\N	\N	\N	t	f	2026-02-02 10:32:45.721	2026-02-02 10:32:45.721
491a4463-ef4c-4cb6-a7a5-25205819d419	USB printer cable 5m	usb-printer-cable-5m	Computer Accessories	pcs	1	670.00	771.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:45.724	2026-02-02 10:32:45.724
69cb1624-9c51-423e-999d-83ff5740432c	USB Printer Cable 3m	usb-printer-cable-3m	Computer Accessories	pcs	1	368.00	423.00	10	34	\N	\N	\N	t	f	2026-02-02 10:32:45.727	2026-02-02 10:32:45.727
5ac958e7-6838-43c3-bb0b-b1da609cd9b7	Wired mouse enet	wired-mouse-enet	Computer Accessories	pcs	1	400.00	460.00	10	12	\N	\N	\N	t	f	2026-02-02 10:32:45.73	2026-02-02 10:32:45.73
d87eefa0-7b7c-4e3d-8837-0cd89f05c33c	mercury wired mouse	mercury-wired-mouse	Computer Accessories	pcs	1	400.00	460.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.734	2026-02-02 10:32:45.734
5d401da4-a437-43d4-84a7-be39f4de7d80	Targus wired mouse	targus-wired-mouse	Computer Accessories	pcs	1	630.00	725.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.738	2026-02-02 10:32:45.738
4d5ad9c8-e4d5-4714-9ebb-8d60c2fb6934	wirelles mouse Aitt	wirelles-mouse-aitt	Computer Accessories	pcs	1	630.00	725.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:45.741	2026-02-02 10:32:45.741
9ceb3269-26a3-4e05-ad1e-2215c5bdd825	Intex Wired Mouse	intex-wired-mouse	Computer Accessories	pcs	1	400.00	460.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.745	2026-02-02 10:32:45.745
6ec000a2-4710-4b0b-9a7c-5b749e80685b	Wirrless Mouse Targus	wirrless-mouse-targus	Computer Accessories	pcs	1	630.00	725.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.749	2026-02-02 10:32:45.749
6da99804-0f27-4b1e-8eca-07e9303ecdf2	Wired mouse Hp	wired-mouse-hp	Computer Accessories	pcs	1	400.00	460.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.752	2026-02-02 10:32:45.752
d79085cf-f53d-41ff-9132-0313ec65f709	wirless mouse mofi	wirrless-mouse-mofi	Computer Accessories	pcs	1	820.00	943.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.755	2026-02-02 10:32:45.755
5f0bf564-a9ff-4b57-aa68-6926ec8255e3	wirless dell mouse	wirless-dell-mouse	Computer Accessories	pcs	1	520.00	598.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.758	2026-02-02 10:32:45.758
cdd2f188-19d6-48d3-9e44-cf20370163dc	max day battery charger	max-day-battery-charger	Computer Accessories	pcs	1	1050.00	1208.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.764	2026-02-02 10:32:45.764
a853f8d7-fa7e-48c3-ab99-76fd0950861f	Dust Cover Desk top	dust-cover-desk-top	Computer Accessories	pcs	1	250.00	288.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:45.768	2026-02-02 10:32:45.768
c02c607d-06d4-493e-a55e-a1d070a476e5	RAM Laptop 4GB	ram-laptop-4gb	Computer Accessories	pcs	1	1400.00	1610.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.771	2026-02-02 10:32:45.771
f6513e38-5fad-4466-8896-f9429d6dc2e4	RAM Laptop 8GB	ram-laptop-8gb	Computer Accessories	pcs	1	2300.00	2645.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.774	2026-02-02 10:32:45.774
0816bdb0-54e4-4b91-975c-6f2735a40a6a	RAM Laptop 2GB	ram-laptop-2gb	Computer Accessories	pcs	1	800.00	920.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.777	2026-02-02 10:32:45.777
f15810ac-89c8-4525-8539-8aee23788f18	Ssd 512gb	ssd-512gb	Computer Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.786	2026-02-02 10:32:45.786
a053a0a0-de85-4127-88c1-aa7a511c51a6	Ssd 1Tb	ssd-1tb	Computer Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:45.79	2026-02-02 10:32:45.79
514ff8ad-44fe-46e5-bf98-75d526c1b2c4	CIMOS Battery	cimos-battery	Computer Accessories	pcs	1	80.00	92.00	10	24	\N	\N	\N	t	f	2026-02-02 10:32:45.791	2026-02-02 10:32:45.791
e89181b6-9def-4665-aa83-779b1b349fac	Celener bord	celener-bord	Computer Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:45.794	2026-02-02 10:32:45.794
50a4f2e3-5fc4-4bef-baea-962f970e4212	Celener screen	celener-screen	Computer Accessories	pcs	1	460.00	529.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.795	2026-02-02 10:32:45.795
bacf488b-3660-4f23-88ca-dc1783b7a31e	Power Supplay intex small	power-supplay-intex-small	Computer Accessories	pcs	1	900.00	1035.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.798	2026-02-02 10:32:45.798
31c3d896-1b54-4288-a3cc-212c328beb1f	Power Supplay intex	power-supplay-intex	Computer Accessories	pcs	1	2300.00	2645.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.801	2026-02-02 10:32:45.801
fc3cdd06-5ee2-4df7-8388-26ebb003905a	Power supplay 780	power-supplay-780	Computer Accessories	pcs	1	3500.00	4025.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.804	2026-02-02 10:32:45.804
44b3ea36-ae0b-4304-9892-1d070e30c5da	Power supplay 720	power-supplay-720	Computer Accessories	pcs	1	4500.00	5175.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.807	2026-02-02 10:32:45.807
adb1bc23-2301-4c8c-a34f-2c5f7baf9c03	Power Supplay 790	power-supplay-790	Computer Accessories	pcs	1	3200.00	3680.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.809	2026-02-02 10:32:45.809
c5c83558-7d60-45cd-b4b2-345276a75e88	Power Supplay 3040	power-supplay-3040	Computer Accessories	pcs	1	4500.00	5175.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.812	2026-02-02 10:32:45.812
19055124-fd83-40b2-88e8-4364c6091555	Power Supplay 3020	power-supplay-3020	Computer Accessories	pcs	1	4500.00	5175.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.815	2026-02-02 10:32:45.815
1d9aba04-b0ab-40cd-92ac-576a966aa9c3	Speaker Desktop Small	speaker-desktop-small	Computer Accessories	pcs	1	700.00	805.00	10	10	\N	\N	\N	t	f	2026-02-02 10:32:45.818	2026-02-02 10:32:45.818
e0f23392-9a49-4798-b1ae-0b6f01a6ea7e	Key bord Dell orginal Desktop	key-bord-dell-orginal-desktop	Computer Accessories	pcs	1	1500.00	1725.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:45.824	2026-02-02 10:32:45.824
7d4e58f6-9357-41f0-8299-494f287bfd6d	Mouse Wireless Logitech	mouse-wireless-logitech	Computer Accessories	pcs	1	860.00	989.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.827	2026-02-02 10:32:45.827
b9fb652a-fe8e-45fa-812d-ba8ed0cf02a3	Laptop keyboard	laptop-keyboard	Computer Accessories	pcs	1	1500.00	1725.00	10	9	\N	\N	\N	t	f	2026-02-02 10:32:45.83	2026-02-02 10:32:45.83
63c730d4-c3e2-44b7-b015-815dc1a20370	Laptop Stand Small	laptop-stand-small	Computer Accessories	pcs	1	2000.00	2300.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.832	2026-02-02 10:32:45.832
f0d194a5-dfaa-426e-a85a-42e1c9a73f02	Spekar Dell Computer Large	spekar-dell-computer-large	Computer Accessories	pcs	1	1000.00	1150.00	10	10	\N	\N	\N	t	f	2026-02-02 10:32:45.821	2026-02-24 10:43:25.46
50500971-fc92-4812-bb7c-8e71822b87b9	Blower Power Small	blower-power	Computer Accessories	pcs	1	4500.00	6500.00	10	1		\N	\N	t	f	2026-02-02 10:32:45.63	2026-02-27 12:23:42.746
22b154c4-af2f-44ae-8f12-b41d69eb898a	Laptop Stand with double fan	laptop-stand-with-double-fan	Computer Accessories	pcs	1	3200.00	3680.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.835	2026-02-02 10:32:45.835
f4ad5a25-3463-421e-a997-4a84b3a0a75d	Wirless keyboard mophi	wirless-keyboard-mophi	Computer Accessories	pcs	1	3000.00	3450.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.838	2026-02-02 10:32:45.838
182596e4-adca-4803-9857-cdebdd4fba38	flexble keyboard	flexble-keyboard	Computer Accessories	pcs	1	860.00	989.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.841	2026-02-02 10:32:45.841
dc2d4c1f-b2d5-41f8-a919-397d918a283d	wired mouse m90	wired-mouse-m90	Computer Accessories	pcs	1	400.00	460.00	10	14	\N	\N	\N	t	f	2026-02-02 10:32:45.844	2026-02-02 10:32:45.844
3149132d-37e7-445b-8b49-60a1b0c5f786	hp wired mouse	hp-wired-mouse	Computer Accessories	pcs	1	400.00	460.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.848	2026-02-02 10:32:45.848
6a3752b7-b272-42df-8a36-bebdce85fd74	Lenevo wirless Mouse	lenevo-wirless-mouse	Computer Accessories	pcs	1	690.00	794.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.853	2026-02-02 10:32:45.853
dd3c8b43-1e27-4cde-9fa9-4faeb15da969	CD	cd	Computer Accessories	pcs	1	65.00	75.00	10	300	\N	\N	\N	t	f	2026-02-02 10:32:45.856	2026-02-02 10:32:45.856
27d40841-e176-46a2-a50f-2b2e40221fea	Cd-R	cd-r	Computer Accessories	pcs	1	90.00	104.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.859	2026-02-02 10:32:45.859
aa751d7c-39cf-4ff5-8931-3f851eabb9a2	Alarm big	alarm-big	Computer Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.862	2026-02-02 10:32:45.862
d9bd8957-9bcf-4976-a56b-def46c54511d	All in one Card Reader	all-in-one-card-reader	Computer Accessories	pcs	1	2300.00	2645.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.864	2026-02-02 10:32:45.864
be767ffe-ab58-4c8d-9589-725a4a0be206	Paper try 3 set	paper-try-3-set	Stationery Items	pcs	1	1800.00	2070.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.867	2026-02-02 10:32:45.867
af851aad-260d-415b-a46c-ac49b3ab244f	Doci	doci	Stationery Items	pcs	1	1400.00	1610.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.87	2026-02-02 10:32:45.87
db76c4b8-6c7f-4ea8-a4c3-bb7bad0a4d1d	paper Quality	paper-quality	Stationery Items	pcs	1	800.00	920.00	10	14	\N	\N	\N	t	f	2026-02-02 10:32:45.873	2026-02-02 10:32:45.873
21b4b24f-985f-439e-87b0-d84210e62b9c	Paper gold A4	paper-gold-a4	Stationery Items	pcs	1	800.00	920.00	10	12	\N	\N	\N	t	f	2026-02-02 10:32:45.875	2026-02-02 10:32:45.875
27ed691a-6ee8-4203-90a8-88571f7ba868	Protracter	protracter	Stationery Items	pcs	1	35.00	40.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.878	2026-02-02 10:32:45.878
e3068924-1a6a-45d2-8183-8eb223cfc9d9	Set Square	set-square	Stationery Items	pcs	1	550.00	633.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.881	2026-02-02 10:32:45.881
287a9c68-a4b1-490a-ba27-39e6983e0070	claro pen	claro-pen	Stationery Items	pcs	1	650.00	748.00	10	9	\N	\N	\N	t	f	2026-02-02 10:32:45.885	2026-02-02 10:32:45.885
5cbdb8e4-5e0a-4c84-a34f-2242c23abd48	Cello pen blue	cello-pen-blue	Stationery Items	pcs	1	950.00	1093.00	10	19	\N	\N	\N	t	f	2026-02-02 10:32:45.888	2026-02-02 10:32:45.888
dd2d79e3-a410-4783-8865-8d5360dea92b	Bic pen	bic-pen	Stationery Items	pcs	1	1100.00	1265.00	10	13	\N	\N	\N	t	f	2026-02-02 10:32:45.891	2026-02-02 10:32:45.891
0bdd51aa-758e-40c4-be76-94e8af9af5a0	black Lexi pen	black-lexi-pen	Stationery Items	pcs	1	350.00	403.00	10	33	\N	\N	\N	t	f	2026-02-02 10:32:45.894	2026-02-02 10:32:45.894
1e8eead0-4249-43ec-a893-880af336d1f7	Fastener	fastener	Stationery Items	pcs	1	160.00	184.00	10	20	\N	\N	\N	t	f	2026-02-02 10:32:45.896	2026-02-02 10:32:45.896
1303ae2c-1b02-41d9-8114-4a4b5cb0b762	white bord marker	white-bord-marker	Stationery Items	pcs	1	360.00	414.00	10	38	\N	\N	\N	t	f	2026-02-02 10:32:45.899	2026-02-02 10:32:45.899
01b6cad7-a3da-4a50-9075-7121c0e678ab	Permanent Marker Abay	permanent-marker-abay	Stationery Items	pcs	1	557.00	641.00	10	9	\N	\N	\N	t	f	2026-02-02 10:32:45.902	2026-02-02 10:32:45.902
2d0a2221-bc9b-475d-a9ae-303352615a5f	Permanent Marker Gx	permanent-marker-gx	Stationery Items	pcs	1	557.00	641.00	10	12	\N	\N	\N	t	f	2026-02-02 10:32:45.905	2026-02-02 10:32:45.905
76ed8971-72ab-4a65-b084-36fe9e9dfc4a	Puncher DP-520	puncher-dp-520	Stationery Items	pcs	1	700.00	805.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.908	2026-02-02 10:32:45.908
2ce0b090-eb6b-47ab-94dc-5ffeb0a82cdc	Pucher p-720	pucher-p-720	Stationery Items	pcs	1	900.00	1035.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:45.91	2026-02-02 10:32:45.91
911d4592-d068-4a9b-b2c0-c12acb32cef0	Stapler kangaro DS-435	stapler-kangaro-ds-435	Stationery Items	pcs	1	900.00	1035.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:45.913	2026-02-02 10:32:45.913
ffecf5e9-c47c-4c97-87e5-e7adb2cd20af	Stapler kangaro DS-335	stapler-kangaro-ds-335	Stationery Items	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:45.916	2026-02-02 10:32:45.916
55240573-cfbe-48f9-a464-cb491b530172	Staples Wire Large Kangaro	staples-wire-large-kangaro	Stationery Items	pcs	1	200.00	230.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.917	2026-02-02 10:32:45.917
32e19e58-e1b0-4428-a353-8572c8aef664	Staples wire 369	staples-wire-369	Stationery Items	pcs	1	550.00	633.00	10	11	\N	\N	\N	t	f	2026-02-02 10:32:45.92	2026-02-02 10:32:45.92
fb5b0f78-bfc7-4227-9f8d-3d9e6ffbc9b7	Staples wire Haevy Duty	staples-wire-haevy-duty	Stationery Items	pcs	1	200.00	230.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.923	2026-02-02 10:32:45.923
a3bb96bd-b7a7-43e5-98ca-352a4c39624d	Flip Chart	flip-chart	Stationery Items	pcs	1	480.00	552.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.925	2026-02-02 10:32:45.925
d3ed9608-3699-41ce-a1ec-88f67fad35da	Ring 14mn	ring-14mn	Stationery Items	pcs	1	1380.00	1587.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.928	2026-02-02 10:32:45.928
c90dff64-8f0d-43ea-b2ce-b2d7dd8c0aa8	Ring 6mm	ring-6mm	Stationery Items	pcs	1	860.00	989.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:45.931	2026-02-02 10:32:45.931
75285077-4de7-41c3-b33b-154dad15ab13	Ring 12mm	ring-12mm	Stationery Items	pcs	1	1380.00	1587.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.934	2026-02-02 10:32:45.934
728bcd1b-c846-41b2-abcf-1864eb558a57	Ring 18mm	ring-18mm	Stationery Items	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:45.937	2026-02-02 10:32:45.937
d3658612-2fe0-4308-9f7d-4543a0f709f0	Calculater CASIO DJ-120TW 2Zero	calculater-casio-dj-120tw-2zero	Stationery Items	pcs	1	2000.00	2300.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:45.938	2026-02-02 10:32:45.938
4336ce89-82e4-48c0-adb1-7764209358a2	Fixer 0.7	fixer-0-7	Stationery Items	pcs	1	65.00	75.00	10	26	\N	\N	\N	t	f	2026-02-02 10:32:45.941	2026-02-02 10:32:45.941
b1b8c063-0c10-484f-a024-4ad28494f9f7	Color Paper A4 Renbo	color-paper-a4-renbo	Stationery Items	pcs	1	580.00	667.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:45.944	2026-02-02 10:32:45.944
4a82fd3a-62bd-464f-bbb8-31869c996949	Carbo 8000H	carbo-8000h	Stationery Items	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:45.946	2026-02-02 10:32:45.946
fa714f81-0fc3-4ab3-8a74-8c6acdbbda1b	Color Paper Spectra	color-paper-spectra	Stationery Items	pcs	1	1300.00	1495.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:45.948	2026-02-02 10:32:45.948
fc6be6b8-51b8-4ee4-a14e-9bd465aaf36b	Tarnsparent Caver	tarnsparent-caver	Stationery Items	pcs	1	1400.00	1610.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.95	2026-02-02 10:32:45.95
179b0c02-a27f-4dfe-ac15-4174764427d0	Hard Caver	hard-caver	Stationery Items	pcs	1	1200.00	1380.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.953	2026-02-02 10:32:45.953
8e1ef539-f097-4c5f-a78d-422e71e6d76b	Id Cradd	id-cradd	Stationery Items	pcs	1	35.00	40.00	10	200	\N	\N	\N	t	f	2026-02-02 10:32:45.956	2026-02-02 10:32:45.956
2c16c821-c822-4620-b36d-d212eb8c1530	Black Board Duster Omega	black-board-duster-omega	Stationery Items	pcs	1	80.00	92.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.959	2026-02-02 10:32:45.959
4ea1ec03-943d-4e5f-b21e-828c0bdee7eb	UHU	uhu	Stationery Items	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:45.962	2026-02-02 10:32:45.962
9ebe5139-912d-49fe-8daf-44a40e89ff2e	Kakey Posta A4 size	kakey-posta-a4-size	Stationery Items	pcs	1	950.00	1093.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.963	2026-02-02 10:32:45.963
39ddd416-c964-4433-81cf-6f398ee59017	Kakey Posta A5 size	kakey-posta-a5-size	Stationery Items	pcs	1	650.00	748.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:45.966	2026-02-02 10:32:45.966
aaf66c75-8f7a-426d-a147-638cd484e1be	Kakey Posta A3 size	kakey-posta-a3-size	Stationery Items	pcs	1	1200.00	1380.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.968	2026-02-02 10:32:45.968
daac7a04-51dd-4004-9d43-bb6917c456dc	stamp ink	stamp-ink	Stationery Items	pcs	1	100.00	115.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.971	2026-02-02 10:32:45.971
7fc34945-4c15-4ad4-b54b-fef05dfbcdca	Stamp Pad	stamp-pad	Stationery Items	pcs	1	100.00	115.00	10	30	\N	\N	\N	t	f	2026-02-02 10:32:45.973	2026-02-02 10:32:45.973
1a3830f2-9c0c-4ac7-9c78-db65861e81da	Note book 5x8 small	note-book-5x8-small	Stationery Items	pcs	1	60.00	69.00	10	207	\N	\N	\N	t	f	2026-02-02 10:32:45.977	2026-02-02 10:32:45.977
1ae858ea-0c43-42b6-acc8-1ed75db6f997	Note book 7X9	note-book-7x9	Stationery Items	pcs	1	80.00	92.00	10	34	\N	\N	\N	t	f	2026-02-02 10:32:45.979	2026-02-02 10:32:45.979
2d40c35e-a9be-42e9-be22-5b0728470d56	Ajenda	ajenda	Stationery Items	pcs	1	280.00	322.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.982	2026-02-02 10:32:45.982
6c45c9b6-b50a-43e3-a819-4c0c17b5ffb2	Filud Bottel	filud-bottel	Stationery Items	pcs	1	120.00	138.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:45.985	2026-02-02 10:32:45.985
c839f22e-6ffb-4da2-b6d1-de38bd004bc6	CM Mastish 43	cm-mastish-43	Stationery Items	pcs	1	920.00	1058.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.991	2026-02-02 10:32:45.991
a52e05af-7a1c-4ad5-a712-b05c4ea9ddd2	Opc	opc	Stationery Items	pcs	1	750.00	863.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.993	2026-02-02 10:32:45.993
8b60d05d-5963-4baa-b428-52df8f4bba78	Box file Kent small	box-file-kent-small	Stationery Items	pcs	1	180.00	207.00	10	12	\N	\N	\N	t	f	2026-02-02 10:32:45.996	2026-02-02 10:32:45.996
6a8ee8c9-8d13-424e-a638-32e79ced7542	Box file KENT	box-file-kent	Stationery Items	pcs	1	280.00	322.00	10	11	\N	\N	\N	t	f	2026-02-02 10:32:45.998	2026-02-02 10:32:45.998
90b6cf5c-bf6c-493d-afc1-a014c4e59ee7	Paper Clip Agraf 33mm	paper-clip-agraf-33mm	Stationery Items	pcs	1	650.00	748.00	10	8	\N	\N	\N	t	f	2026-02-02 10:32:46.001	2026-02-02 10:32:46.001
d1ed3fef-2a2f-4008-9f36-c21c008c9af4	Registration Book impoter 25x35	registration-book-impoter-25x35	Stationery Items	pcs	1	650.00	748.00	10	15	\N	\N	\N	t	f	2026-02-02 10:32:46.003	2026-02-02 10:32:46.003
6998603c-23f6-4648-957e-f925fa2e7e33	Registration Book impoter 20x30	registration-book-impoter-20x30	Stationery Items	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.006	2026-02-02 10:32:46.006
f16afd06-559f-4476-bf65-f558a58d7a43	Registration Book gbewoche Local Small	registration-book-gbewoche-local-small	Stationery Items	pcs	1	700.00	805.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.007	2026-02-02 10:32:46.007
30e324aa-9e5a-4637-8f29-557b0897de36	file masriya gmed	file-masriya-gmed	Stationery Items	pcs	1	29.00	33.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:46.01	2026-02-02 10:32:46.01
dd28cbf1-e266-419b-8372-8b4d2d13f904	Dot Pencile	dot-pencile	Stationery Items	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.013	2026-02-02 10:32:46.013
fc00e4c7-c4cb-42fe-955f-f4c9f64d8d6a	Eraser Rubber	eraser-rubber	Stationery Items	pcs	1	4.00	5.00	10	40	\N	\N	\N	t	f	2026-02-02 10:32:46.014	2026-02-02 10:32:46.014
1455abd7-1e3b-4519-a097-69e540208ccb	Scoch tap	scoch-tap	Stationery Items	pcs	1	85.00	98.00	10	239	\N	\N	\N	t	f	2026-02-02 10:32:46.017	2026-02-02 10:32:46.017
c5c0f077-8972-43c7-a8bf-0e69a515831a	Plaster Big	plaster-big	Stationery Items	pcs	1	265.00	305.00	10	45	\N	\N	\N	t	f	2026-02-02 10:32:46.019	2026-02-02 10:32:46.019
c0df9410-6931-4b26-ba41-d72e52b132ac	City soap	city-soap	Stationery Items	pcs	1	60.00	69.00	10	50	\N	\N	\N	t	f	2026-02-02 10:32:46.022	2026-02-02 10:32:46.022
38b52efa-b69d-482f-a8b5-fadab4facc2c	Sky Soap 250gm	sky-soap-250gm	Stationery Items	pcs	1	77.00	89.00	10	48	\N	\N	\N	t	f	2026-02-02 10:32:46.024	2026-02-02 10:32:46.024
9befb9c0-ea04-44d9-b0da-763a54a0bb97	Okay soap 230gm	okay-soap-230gm	Stationery Items	pcs	1	58.00	67.00	10	50	\N	\N	\N	t	f	2026-02-02 10:32:46.027	2026-02-02 10:32:46.027
ba3b49f8-180e-4fee-817e-8835c00dd46e	Hand liquid soap	hand-liquid-soap	Stationery Items	pcs	1	80.00	92.00	10	12	\N	\N	\N	t	f	2026-02-02 10:32:46.03	2026-02-02 10:32:46.03
5f0a8b83-c8b6-47d0-9e6a-5a7145d78406	Life bouy 70gm	life-bouy-70gm	Stationery Items	pcs	1	48.00	55.00	10	39	\N	\N	\N	t	f	2026-02-02 10:32:46.032	2026-02-02 10:32:46.032
6fc1db4b-1bfb-4770-85c6-f79af48b377a	Life bouy 150gm	life-bouy-150gm	Stationery Items	pcs	1	103.00	118.00	10	51	\N	\N	\N	t	f	2026-02-02 10:32:46.035	2026-02-02 10:32:46.035
dbfe0eaa-34f9-48c1-84ae-9aafbdb96207	Powder Soap Zahara 200gm	powder-soap-zahara-200gm	Stationery Items	pcs	1	43.00	49.00	10	18	\N	\N	\N	t	f	2026-02-02 10:32:46.038	2026-02-02 10:32:46.038
792735e7-c3ce-441a-8965-c6a444b32660	Hand battery Reachargble	hand-battery-reachargble	Stationery Items	pcs	1	863.00	992.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.04	2026-02-02 10:32:46.04
526637dc-d1cd-4914-b472-7e23f6b39ee9	Foxxa big	foxxa-big	Stationery Items	pcs	1	35.00	40.00	10	18	\N	\N	\N	t	f	2026-02-02 10:32:46.043	2026-02-02 10:32:46.043
60f8f2cc-3789-4912-bfba-7ce307e493bc	Sponge	sponge	Stationery Items	pcs	1	12.00	14.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.046	2026-02-02 10:32:46.046
674468ed-8037-4f54-89cf-a6c846c44e76	Gion Berkina 800ml	gion-berkina-800ml	Stationery Items	pcs	1	83.00	95.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.048	2026-02-02 10:32:46.048
1434fcb3-864b-41b6-be58-94a893946b86	Hand Guant	hand-guant	Stationery Items	pcs	1	120.00	138.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.051	2026-02-02 10:32:46.051
0cd0fb43-c5ed-4dea-b33a-971f6aaccfc7	Green Soft	green-soft	Stationery Items	pcs	1	32.00	37.00	10	12	\N	\N	\N	t	f	2026-02-02 10:32:46.054	2026-02-02 10:32:46.054
32b60472-dad0-4892-b71a-7c10fb33b1f1	Social Soft	social-soft	Stationery Items	pcs	1	30.00	35.00	10	19	\N	\N	\N	t	f	2026-02-02 10:32:46.057	2026-02-02 10:32:46.057
4381510a-1e3e-4d41-bea2-eaa4fcc14d91	Mop	mop	Stationery Items	pcs	1	184.00	212.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:46.059	2026-02-02 10:32:46.059
a2218f32-7662-46b2-8e2c-5d6f9f649a0e	Mop imported	mop-imported	Stationery Items	pcs	1	250.00	288.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.062	2026-02-02 10:32:46.062
430035f2-1483-49de-85b6-00564586e79a	Broom	broom	Stationery Items	pcs	1	127.00	146.00	10	13	\N	\N	\N	t	f	2026-02-02 10:32:46.065	2026-02-02 10:32:46.065
ad352165-a70d-4ff4-9aff-84ad67fad98f	Rach 6U	rach-6u	Networking Accessories	pcs	1	16500.00	18975.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.069	2026-02-02 10:32:46.069
06ded0ae-387a-4751-9022-03a05c370c30	UTP CABLE CAT 6 H.S power	utp-cable-cat-6-h-s-power	Networking Accessories	pcs	1	18000.00	20700.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.071	2026-02-02 10:32:46.071
c19b1171-18ad-49ee-9b4d-a941a2e43d46	UTP CABLE CAT 6 D-link	utp-cable-cat-6-d-link	Networking Accessories	pcs	1	19550.00	22483.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.074	2026-02-02 10:32:46.074
a677df9a-6ed6-495f-ab4b-afde9005dcf2	UTP Cable jinlair	utp-cable-jinlair	Networking Accessories	pcs	1	14375.00	16531.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.077	2026-02-02 10:32:46.077
89911c6f-e681-4c31-8f55-4095ef1bd1e7	pach cord 5m	pach-cord-5m	Networking Accessories	pcs	1	500.00	575.00	10	15	\N	\N	\N	t	f	2026-02-02 10:32:46.08	2026-02-02 10:32:46.08
e9a1d082-83ab-4e40-b866-2b5906c856a3	pach cord 3m	pach-cord-3m	Networking Accessories	pcs	1	350.00	403.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:46.083	2026-02-02 10:32:46.083
f39c6554-30d9-4f94-8cdd-ba1a7b36627f	Pach Crod 1m	pach-crod-1m	Networking Accessories	pcs	1	230.00	265.00	10	99	\N	\N	\N	t	f	2026-02-02 10:32:46.086	2026-02-02 10:32:46.086
9781ccfb-bd5e-45e0-9105-42eac9ee30e9	pach cord 2m	pach-cord-2m	Networking Accessories	pcs	1	300.00	345.00	10	20	\N	\N	\N	t	f	2026-02-02 10:32:46.089	2026-02-02 10:32:46.089
15cbe780-327c-4321-969a-6b31cff51047	Cosul Cable vga port	cosul-cable-vga-port	Networking Accessories	pcs	1	1380.00	1587.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.092	2026-02-02 10:32:46.092
cfe2ab2c-5487-4fe9-8c53-02f7f49efce1	Cable Tie 50mm	cable-tie-50mm	Networking Accessories	pcs	1	850.00	978.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.094	2026-02-02 10:32:46.094
63a748e7-e91d-4b0e-975e-8dadb09dca2f	Tp-Link wirless Access Point 3 Ante	tp-link-wirless-access-point-3-ante	Networking Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.097	2026-02-02 10:32:46.097
e2901df5-1d67-4f7b-98d9-9b0493adc3a9	Tp-Link Wifi Range Extender	tp-link-wifi-range-extender	Networking Accessories	pcs	1	3500.00	4025.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.098	2026-02-02 10:32:46.098
1df318da-77c6-4fd0-8831-11b49e61c646	Tp-link Ac 1200 router 4 antena	tp-link-ac-1200-router-4-antena	Networking Accessories	pcs	1	16600.00	19090.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.101	2026-02-02 10:32:46.101
a30c1aac-4843-481e-8a3c-092a90c6cda2	Bevot 4gb/5g Mobile WIFI	bevot-4gb-5g-mobile-wifi	Networking Accessories	pcs	1	4000.00	4600.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.103	2026-02-02 10:32:46.103
f90df55b-5384-4561-b738-610cd4f86ae9	tp-link 3G/4G Router	tp-link-3g-4g-router	Networking Accessories	pcs	1	4500.00	5175.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.106	2026-02-02 10:32:46.106
d83e5e77-a8a6-4ddd-8a96-39a33f1057e9	LTE Wirreless wifi	lte-wirreless-wifi	Networking Accessories	pcs	1	4600.00	5290.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.109	2026-02-02 10:32:46.109
82e24c30-951d-4d7b-bd34-674802802ade	tp-link wi-fi modem ADSL 2antena	tp-link-wi-fi-modem-adsl-2antena	Networking Accessories	pcs	1	5500.00	6325.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.111	2026-02-02 10:32:46.111
622b79b6-bb83-498d-8073-ee7c992ffbfb	tp-link Acess point wirless Ac 1200 gigabyt	tp-link-acess-point-wirless-ac-1200-gigabyt	Networking Accessories	pcs	1	8500.00	9775.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.114	2026-02-02 10:32:46.114
ecb27391-15f0-498d-ac0a-fcb588154063	tp-link usb wirrless adbter mini	tp-link-usb-wirrless-adbter-mini	Networking Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.117	2026-02-02 10:32:46.117
0ef9f35e-205d-45c0-a555-c110b217579e	usb wirlles WIFI adapter	usb-wirlles-wifi-adapter	Networking Accessories	pcs	1	288.00	331.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:46.118	2026-02-02 10:32:46.118
e62a4130-94d4-4e3b-b15a-7c9a792ed590	tp-link wireless n pci express 150m	tp-link-wireless-n-pci-express-150m	Networking Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.121	2026-02-02 10:32:46.121
a4ce5895-0c23-4c99-b283-f9917423c6b3	Hikvission Router 2Antena	hikvission-router-2antena	Networking Accessories	pcs	1	4000.00	4600.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.123	2026-02-02 10:32:46.123
610db2d6-7023-4c60-aafe-d4fa0aba7596	Type C Ethernet Adapter	type-c-ethernet-adapter	Networking Accessories	pcs	1	1100.00	1265.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.125	2026-02-02 10:32:46.125
e175f424-25be-49e4-a3c1-faed0d700c00	USB 3.0 ethernet adapter	usb-3-0-ethernet-adapter	Networking Accessories	pcs	1	1050.00	1208.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:46.128	2026-02-02 10:32:46.128
24062761-bc5f-44f1-98d5-f9226e007d18	Switch 24 port D-Link	switch-24-port-d-link	Networking Accessories	pcs	1	14500.00	16675.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.131	2026-02-02 10:32:46.131
a20f98d8-20eb-427a-8c22-3746a426e609	Switch D-Link poe	switch-d-link-poe	Networking Accessories	pcs	1	8000.00	9200.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.133	2026-02-02 10:32:46.133
5d7937ef-dae6-4d47-b1e9-dcbac7d35dc9	Switch 8 port D-Link	switch-8-port-d-link	Networking Accessories	pcs	1	2530.00	2910.00	10	8	\N	\N	\N	t	f	2026-02-02 10:32:46.137	2026-02-02 10:32:46.137
9c826b8e-e018-4184-ac19-ad918f804518	pach panale 48 port	pach-panale-48-port	Networking Accessories	pcs	1	7500.00	8625.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.139	2026-02-02 10:32:46.139
6ebf112e-45fd-4997-9e02-9492b0b374b6	pach panale 24 port	pach-panale-24-port	Networking Accessories	pcs	1	4100.00	4715.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.142	2026-02-02 10:32:46.142
c72b747d-3a2a-48b5-9508-577431b28ac4	Midea converter single mode	midea-converter-single-mode	Networking Accessories	pcs	1	6400.00	7360.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.145	2026-02-02 10:32:46.145
b709fd91-91f2-4eed-859d-7071baaadff3	USB enternet adapter windo 7-10	usb-enternet-adapter-windo-7-10	Networking Accessories	pcs	1	550.00	633.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.15	2026-02-02 10:32:46.15
81f31321-d10f-4772-b119-4be4ba55a4d4	VGA Spliter 1 to 2	vga-spliter-1-to-2	Networking Accessories	pcs	1	900.00	1035.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.153	2026-02-02 10:32:46.153
92331fdd-5700-4fb6-82ba-cbdff6b59472	Network Foult Finder	network-foult-finder	Networking Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.156	2026-02-02 10:32:46.156
cdb4ce91-b899-4b2f-a84b-3f03c09b8f65	Cremper	cremper	Networking Accessories	pcs	1	750.00	863.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.158	2026-02-02 10:32:46.158
fec9b36d-9f99-4984-a2ef-23b3c7a3f008	Cremper D- link	cremper-d-link	Networking Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.161	2026-02-02 10:32:46.161
41468fa5-3727-4f26-b50e-3f37fd0ccadf	Net wok tester	net-wok-tester	Networking Accessories	pcs	1	1150.00	1323.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.162	2026-02-02 10:32:46.162
c3f21e1e-2c5e-4b70-a6f1-98e58d99f0a8	Network Puncher	network-puncher	Networking Accessories	pcs	1	2645.00	3042.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.165	2026-02-02 10:32:46.165
acb9b711-6cf7-412e-9086-32e5b56041e9	Power bank Mi 30000	power-bank-mi-30000	Networking Accessories	pcs	1	6600.00	7590.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.168	2026-02-02 10:32:46.168
1b8a691d-65fa-42d0-a80b-0fa8944e4d7d	woll out let double	woll-out-let-double	Networking Accessories	pcs	1	650.00	748.00	10	80	\N	\N	\N	t	f	2026-02-02 10:32:46.17	2026-02-02 10:32:46.17
dbaf6c57-773e-44d6-aa09-270d862f7569	Woll Out let Single	woll-out-let-single	Networking Accessories	pcs	1	450.00	518.00	10	26	\N	\N	\N	t	f	2026-02-02 10:32:46.173	2026-02-02 10:32:46.173
9835fcdc-fb33-4341-9b07-c6aee3244799	RJ-11	rj-11	Networking Accessories	pcs	1	16.00	18.00	10	98	\N	\N	\N	t	f	2026-02-02 10:32:46.177	2026-02-02 10:32:46.177
529e8611-7762-452c-8fd0-f666cf58b1a3	RJ-45	rj-45	Networking Accessories	pcs	1	9.00	10.00	10	981	\N	\N	\N	t	f	2026-02-02 10:32:46.179	2026-02-02 10:32:46.179
374e9d73-7e9d-479c-9f05-b82f96ed1782	RJ-45 Jacket	rj-45-jacket	Networking Accessories	pcs	1	4.00	5.00	10	953	\N	\N	\N	t	f	2026-02-02 10:32:46.182	2026-02-02 10:32:46.182
9f8911a8-feb3-4f9e-8f38-c37a4e11c50f	Dish connector	dish-connector	Networking Accessories	pcs	1	10.00	12.00	10	37	\N	\N	\N	t	f	2026-02-02 10:32:46.184	2026-02-02 10:32:46.184
ccebb85f-79b5-49f9-9ff2-2bccfaa65139	fisher 8	fisher-8	Networking Accessories	pcs	1	220.00	253.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.187	2026-02-02 10:32:46.187
2d209dc3-85ca-4f4e-b5f5-1cefdcc6b3cc	fisher 6	fisher-6	Networking Accessories	pcs	1	200.00	230.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.19	2026-02-02 10:32:46.19
88e8c5d9-e822-4562-ad41-7e0056993548	fisher 10	fisher-10	Networking Accessories	pcs	1	250.00	288.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.192	2026-02-02 10:32:46.192
284505af-e81f-4461-8fcc-f31798745b1a	screw 6mm	screw-6mm	Networking Accessories	pcs	1	650.00	748.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:46.195	2026-02-02 10:32:46.195
4706386b-c7b0-426c-9f18-627e153283b1	Logitech Pointer	logitech-pointer	Networking Accessories	pcs	1	2100.00	2415.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.197	2026-02-02 10:32:46.197
fd87ab4e-fc64-470f-a536-f4dadc9f8628	Presenter Pointer	presenter-pointer	Networking Accessories	pcs	1	950.00	1093.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:46.2	2026-02-02 10:32:46.2
3dfb1a5b-717c-4375-9ac4-888ffc49115f	Pointer 2nd Logitech	pointer-2nd-logitech	Networking Accessories	pcs	1	1850.00	2128.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.203	2026-02-02 10:32:46.203
b3cf7b4b-125c-4810-b5f7-ff2235c9348c	screw 8	screw-8	Networking Accessories	pcs	1	650.00	748.00	10	8	\N	\N	\N	t	f	2026-02-02 10:32:46.205	2026-02-02 10:32:46.205
bc5c12f5-4443-4da8-8715-1118b741683a	Tranking 16x16 3Mater	tranking-16x16-3mater	Networking Accessories	pcs	1	265.00	305.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.208	2026-02-02 10:32:46.208
db5f473a-ccea-4bdb-9ec1-12c429e131b7	Tranking 40x25 3Mater	tranking-40x25-3mater	Networking Accessories	pcs	1	695.00	799.00	10	19	\N	\N	\N	t	f	2026-02-02 10:32:46.211	2026-02-02 10:32:46.211
6e3c08bf-5a87-436c-aa09-9bdd56756654	Tranking 40x60 3Mater	tranking-40x60-3mater	Networking Accessories	pcs	1	995.00	1144.00	10	64	\N	\N	\N	t	f	2026-02-02 10:32:46.213	2026-02-02 10:32:46.213
b9b1c160-606e-48ba-98db-1bee17d2c1e0	Total heat gun	total-heat-gun	Other Electronics & Accessories	pcs	1	6000.00	6900.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.216	2026-02-02 10:32:46.216
a7ade9a3-cf08-4269-bcb7-b69ab44a30f0	Cooking Plate(stove)	cooking-plate-stove	Other Electronics & Accessories	pcs	1	1500.00	1725.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.219	2026-02-02 10:32:46.219
1fffdd35-d391-4499-922e-9160e97dd0ee	Boya mick	boya-mick	Other Electronics & Accessories	pcs	1	4500.00	5175.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.222	2026-02-02 10:32:46.222
370275c4-bb1b-47de-8795-e77141fb1711	Wirrles Mic Boya	wirrles-mic-boya	Other Electronics & Accessories	pcs	1	2200.00	2530.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.225	2026-02-02 10:32:46.225
e53a93bf-ded7-43bb-af1f-2c1fed046ef2	Wirrless K9	wirrless-k9	Other Electronics & Accessories	pcs	1	1400.00	1610.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.228	2026-02-02 10:32:46.228
58b263e9-e339-4adc-955f-e7773483c951	Mic Stand	mic-stand	Other Electronics & Accessories	pcs	1	2000.00	2300.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.231	2026-02-02 10:32:46.231
9490b909-95d9-4b1d-8ef0-c60fb1f2592e	Wired Ahuja Mice	wired-ahuja-mice	Other Electronics & Accessories	pcs	1	3000.00	3450.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.234	2026-02-02 10:32:46.234
31a10610-7d05-430f-a636-eb3688d41815	Barcode Scanner	barcode-scanner	Other Electronics & Accessories	pcs	1	18500.00	21275.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.237	2026-02-02 10:32:46.237
c280f5fe-0c55-4099-a489-a609d74eddd4	Printer formater Bord 402dn	printer-formater-bord-402dn	Other Electronics & Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.239	2026-02-02 10:32:46.239
78eb7c6e-4c1a-4e15-aeca-a1262599fd0e	Printer formater Bord 400dn	printer-formater-bord-400dn	Other Electronics & Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.242	2026-02-02 10:32:46.242
248aa191-249a-4fd7-8a78-28d21d4f0e21	printer formater Bord 2055d	printer-formater-bord-2055d	Other Electronics & Accessories	pcs	1	4500.00	5175.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.245	2026-02-02 10:32:46.245
d6897bc5-c3b5-4ed6-952d-f4e73f58728b	printer formater Bord 2015d	printer-formater-bord-2015d	Other Electronics & Accessories	pcs	1	4500.00	5175.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.248	2026-02-02 10:32:46.248
99e8662d-c122-4960-9c83-b941ee19b8e0	Pci Exprece Crad USB	pci-exprece-crad-usb	Other Electronics & Accessories	pcs	1	750.00	863.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.251	2026-02-02 10:32:46.251
f56f5d2c-fa01-40a5-a37f-db2fe4e41fee	Pci Exprece Crad	pci-exprece-crad	Other Electronics & Accessories	pcs	1	2500.00	2875.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.254	2026-02-02 10:32:46.254
10dc8aa2-e2b3-4c32-9eec-4b6cc778369c	Cooler	cooler	Other Electronics & Accessories	pcs	1	650.00	748.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.257	2026-02-02 10:32:46.257
54256018-de44-4614-89f7-9465b603181a	Digital dicoder popular	digital-dicoder-popular	Other Electronics & Accessories	pcs	1	1500.00	1725.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.259	2026-02-02 10:32:46.259
29d75b3d-c06d-4ec1-b56a-1a3ef90e188a	Mother board 3020	mother-board-3020	Other Electronics & Accessories	pcs	1	16000.00	18400.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.262	2026-02-02 10:32:46.262
720f357a-45f7-441e-bff1-d7d84426048f	Solar Envertor	solar-envertor	Other Electronics & Accessories	pcs	1	2500.00	2875.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.265	2026-02-02 10:32:46.265
c6659a91-dda6-445f-a6af-202f4ff11dbc	Hik vision 4 chanale NVR	hik-vision-4-chanale-nvr	Other Electronics & Accessories	pcs	1	14500.00	16675.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.268	2026-02-02 10:32:46.268
a28e053f-7b62-4927-b4b0-398401acc548	Camera 4mp indour	camera-4mp-indour	Other Electronics & Accessories	pcs	1	14300.00	16445.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:46.271	2026-02-02 10:32:46.271
7cefb3ad-37a8-48b7-841e-71c86b9fcdb3	Camera 4mp outdour	camera-4mp-outdour	Other Electronics & Accessories	pcs	1	14300.00	16445.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.273	2026-02-02 10:32:46.273
97fcaacf-48d3-47b1-b81f-f032f74d47fa	Camera 2mp in dour	camera-2mp-in-dour	Other Electronics & Accessories	pcs	1	11500.00	13225.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:46.276	2026-02-02 10:32:46.276
7f30ad8e-cbfd-414f-ba9d-0bc80816d7de	Camera 2mp out dour	camera-2mp-out-dour	Other Electronics & Accessories	pcs	1	11500.00	13225.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.278	2026-02-02 10:32:46.278
3f01d329-0cb6-46e1-ad25-7e1f26838196	Dvr 4 channel hikvission with kit	dvr-4-channel-hikvission-with-kit	Other Electronics & Accessories	pcs	1	32000.00	36800.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.281	2026-02-02 10:32:46.281
8e6e8d18-8d2f-4d06-86f8-8c6f366bed42	Dvr 8 channel hikvission with kit	dvr-8-channel-hikvission-with-kit	Other Electronics & Accessories	pcs	1	40000.00	46000.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.284	2026-02-02 10:32:46.284
051e9f3a-9de1-4337-ab7d-42ff708ea03b	cctv camera kit with wifi 2camera	cctv-camera-kit-with-wifi-2camera	Other Electronics & Accessories	pcs	1	28000.00	32200.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.286	2026-02-02 10:32:46.286
2950a805-6ce1-4775-a0b1-ba7245f61ab6	Ezviz 360 Camera	ezviz-360-camera	Other Electronics & Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.289	2026-02-02 10:32:46.289
c7873b15-492f-40a4-b442-d0fafa6602e3	Smart Home Camera Panaroma	smart-home-camera-panaroma	Other Electronics & Accessories	pcs	1	11000.00	12650.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.292	2026-02-02 10:32:46.292
89990668-220a-4bcc-ac6b-2f72a9ba6466	Web Came Camera	web-came-camera	Other Electronics & Accessories	pcs	1	2000.00	2300.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.295	2026-02-02 10:32:46.295
7931ff9d-7b4e-488e-845c-43cacf512d7f	Smart Home Camera	smart-home-camera	Other Electronics & Accessories	pcs	1	1500.00	1725.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.297	2026-02-02 10:32:46.297
bc2ca9ce-6c43-4d57-838a-d0404df26236	Logitech web camera930	logitech-web-camera930	Other Electronics & Accessories	pcs	1	28000.00	32200.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.3	2026-02-02 10:32:46.3
6568b940-6b1c-4c2f-bb10-aefee7476459	Logitech web camera 920	logitech-web-camera-920	Other Electronics & Accessories	pcs	1	23000.00	26450.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.303	2026-02-02 10:32:46.303
b174b285-564a-4407-9ae5-4f0bf5d2baff	Logitech web camera 720	logitech-web-camera-720	Other Electronics & Accessories	pcs	1	6500.00	7475.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.306	2026-02-02 10:32:46.306
4de61992-f9a7-4837-9205-cc88d5da5e01	USB TV Stick	usb-tv-stick	Other Electronics & Accessories	pcs	1	650.00	748.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:46.307	2026-02-02 10:32:46.307
173dc4f9-6496-4f34-9696-a6830731008f	Meltimeter	meltimeter	Other Electronics & Accessories	pcs	1	2300.00	2645.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.31	2026-02-02 10:32:46.31
97aa8303-071e-4598-9b0f-b2275d042e9a	Multimeter YX-360TR	multimeter-yx-360tr	Other Electronics & Accessories	pcs	1	950.00	1093.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.313	2026-02-02 10:32:46.313
e55f10a2-0d79-4647-b168-d004d782d06a	9V adapter	9v-adapter	Other Electronics & Accessories	pcs	1	700.00	805.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.315	2026-02-02 10:32:46.315
580d41db-d45b-45cb-a65a-bb35c7881297	12V adapter	12v-adapter	Other Electronics & Accessories	pcs	1	750.00	863.00	10	7	\N	\N	\N	t	f	2026-02-02 10:32:46.318	2026-02-02 10:32:46.318
9911172e-1001-41bf-ab6d-22f858409e43	5V adapter	5v-adapter	Other Electronics & Accessories	pcs	1	700.00	805.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.321	2026-02-02 10:32:46.321
90e2916c-f42a-4593-84f7-ee1f0959ba33	VGA Spliter 4 chanale	vga-spliter-4-chanale	Other Electronics & Accessories	pcs	1	1800.00	2070.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.324	2026-02-02 10:32:46.324
64aa819d-d3f1-4a09-8ef4-bd33857b5663	Panasonic Battery camera	panasonic-battery-camera	Other Electronics & Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.327	2026-02-02 10:32:46.327
9bfdd103-425e-464b-b123-6c0de18c2518	Camera battery charger canon 5d	camera-battery-charger-canon-5d	Other Electronics & Accessories	pcs	1	5500.00	6325.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.33	2026-02-02 10:32:46.33
68d3a491-be04-4da7-bc25-d4055f17372c	Traveler charger	traveler-charger	Other Electronics & Accessories	pcs	1	950.00	1093.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.333	2026-02-02 10:32:46.333
068619f7-93e3-43e5-ade3-050b4f188aa1	Sony Sound recorder WithoutUSB Port	sony-sound-recorder-withoutusb-port	Other Electronics & Accessories	pcs	1	8500.00	9775.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.336	2026-02-02 10:32:46.336
7447cd37-231b-44e9-a6ec-1c60c5d6b65a	Sony Sound recorder	sony-sound-recorder	Other Electronics & Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.339	2026-02-02 10:32:46.339
886164bf-7843-4b66-9080-a56bee0abc77	HDMI Spliter 8 chanale	hdmi-spliter-8-chanale	Other Electronics & Accessories	pcs	1	4000.00	4600.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.34	2026-02-02 10:32:46.34
61e4536b-9f26-4ddc-b5f8-13738ea458f4	HDMI Spliter 4 chanale	hdmi-spliter-4-chanale	Other Electronics & Accessories	pcs	1	2000.00	2300.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.343	2026-02-02 10:32:46.343
2912624d-8e86-4123-ab61-5db56bf6a042	Head seat STN-10	head-seat-stn-10	Other Electronics & Accessories	pcs	1	1500.00	1725.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.346	2026-02-02 10:32:46.346
c87f05d0-9a7c-44af-bfef-89b6a3b84da2	Head Seat STN-13	head-seat-stn-13	Other Electronics & Accessories	pcs	1	3450.00	3968.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.349	2026-02-02 10:32:46.349
f98bf1d6-3736-42dc-b398-d8a111f583a3	Head Seat wired welie	head-seat-wired-welie	Other Electronics & Accessories	pcs	1	2600.00	2990.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.351	2026-02-02 10:32:46.351
d0eb302b-adf4-492c-a1ae-6d4c09ff4f33	Ear pad wirrless	ear-pad-wirrless	Other Electronics & Accessories	pcs	1	1500.00	1725.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.354	2026-02-02 10:32:46.354
2af9d689-d656-482b-b2eb-d4529cec8bcd	HDMI Extender bay cat 6/cat5	hdmi-extender-bay-cat-6-cat5	Other Electronics & Accessories	pcs	1	2300.00	2645.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.357	2026-02-02 10:32:46.357
463b5058-3e42-4bad-b251-ce071f9c14b9	Baku tool kit	baku-tool-kit	Other Electronics & Accessories	pcs	1	750.00	863.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.36	2026-02-02 10:32:46.36
11b2e949-ad2d-40f8-becb-6c086f139d60	Universal adapter 24V/ Notebook	universal-adapter-24v-notebook	Other Electronics & Accessories	pcs	1	1500.00	1725.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.362	2026-02-02 10:32:46.362
5a6479b9-d105-4d8c-aeb1-7eaac34f2796	Camera bag smaal	camera-bag-smaal	Other Electronics & Accessories	pcs	1	450.00	518.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.365	2026-02-02 10:32:46.365
e350dc31-ebd0-4d10-922a-55dbfccf6a4d	Laptop Bag cat 2nd	laptop-bag-cat-2nd	Other Electronics & Accessories	pcs	1	6500.00	7475.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.368	2026-02-02 10:32:46.368
0e1ac318-2020-4f60-ba3b-519f720c7834	Laptop Bag Cat Orignal	laptop-bag-cat-orignal	Other Electronics & Accessories	pcs	1	8700.00	10005.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:46.371	2026-02-02 10:32:46.371
50502ad5-abea-4d60-91a0-578e4ba9cf32	Laptop Bag Cat 3rd	laptop-bag-cat-3rd	Other Electronics & Accessories	pcs	1	5200.00	5980.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.374	2026-02-02 10:32:46.374
ea68ca1e-3ba7-41d7-b0d7-0b9bea6c52f1	Laptop Bag Noxia Orginal	laptop-bag-noxia-orginal	Other Electronics & Accessories	pcs	1	4700.00	5405.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.376	2026-02-02 10:32:46.376
d5e91b64-635c-42fd-ba34-881d3169ce76	Laptop Bag Normal Side	laptop-bag-normal-side	Other Electronics & Accessories	pcs	1	550.00	633.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.379	2026-02-02 10:32:46.379
751ef86a-b0d2-4a4f-9cc1-8cea9cdc1a4e	Laptop Bag Normal Back	laptop-bag-normal-back	Other Electronics & Accessories	pcs	1	3200.00	3680.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.382	2026-02-02 10:32:46.382
0e059888-8954-4d86-92af-4c415c0cbb7a	Laptop Bag Noxia	laptop-bag-noxia	Other Electronics & Accessories	pcs	1	3900.00	4485.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.385	2026-02-02 10:32:46.385
698670f7-533f-4953-b962-ae5c90b7a48b	Laptop side bag	laptop-side-bag	Other Electronics & Accessories	pcs	1	2900.00	3335.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.387	2026-02-02 10:32:46.387
03553045-b7df-4f46-a984-88e8664fd7ed	Laptop Bag Umantu	laptop-bag-umantu	Other Electronics & Accessories	pcs	1	4000.00	4600.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.39	2026-02-02 10:32:46.39
099613c0-f32b-431d-9767-ce75bb76f710	Stablizer AVR 5000VA	stablizer-avr-5000va	Other Electronics & Accessories	pcs	1	13000.00	14950.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.392	2026-02-02 10:32:46.392
5a1fdfa3-cce7-44fb-aab9-a31d96d56336	Dell screen	dell-screen	Other Electronics & Accessories	pcs	1	19000.00	21850.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.395	2026-02-02 10:32:46.395
e8e6c428-4ba0-4a79-abd4-5f0385d78cf8	divider power sourse	divider-power-sourse	Other Electronics & Accessories	pcs	1	650.00	748.00	10	18	\N	\N	\N	t	f	2026-02-02 10:32:46.398	2026-02-02 10:32:46.398
97212943-c08c-49a9-9501-e0328764f533	PDU	pdu	Other Electronics & Accessories	pcs	1	1600.00	1840.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.4	2026-02-02 10:32:46.4
f064d3f0-6578-4ca3-b223-f0dd1c676d31	9V Battery	9v-battery	Other Electronics & Accessories	pcs	1	140.00	161.00	10	19	\N	\N	\N	t	f	2026-02-02 10:32:46.403	2026-02-02 10:32:46.403
9005b15b-e3b9-47ab-be0f-882cbd15994a	Battery AAA	battery-aaa	Other Electronics & Accessories	pcs	1	80.00	92.00	10	121	\N	\N	\N	t	f	2026-02-02 10:32:46.406	2026-02-02 10:32:46.406
a8f80883-255e-4dbc-b61b-3028736c1788	Battery AAA rechargeble	battery-aaa-rechargeble	Other Electronics & Accessories	pcs	1	300.00	345.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.409	2026-02-02 10:32:46.409
cc2d9c8a-ad2d-4433-aecf-7017eebe5651	Battery AA	battery-aa	Other Electronics & Accessories	pcs	1	80.00	92.00	10	61	\N	\N	\N	t	f	2026-02-02 10:32:46.412	2026-02-02 10:32:46.412
ec4a1696-791a-46a1-93b3-2f40bbf341d2	Sencor Battery	sencor-battery	Other Electronics & Accessories	pcs	1	80.00	92.00	10	28	\N	\N	\N	t	f	2026-02-02 10:32:46.414	2026-02-02 10:32:46.414
3de90d75-7ae9-4cd2-8fdc-0fda5ce52883	Divider texas	divider-texas	Other Electronics & Accessories	pcs	1	1150.00	1323.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.417	2026-02-02 10:32:46.417
1be5db14-f9c3-4637-b105-17f67182facf	Divider Gardian Shiled 6 port	divider-gardian-shiled-6-port	Other Electronics & Accessories	pcs	1	1250.00	1438.00	10	9	\N	\N	\N	t	f	2026-02-02 10:32:46.42	2026-02-02 10:32:46.42
8043bc09-8a93-42b1-b71c-ff9d87704b82	Divider Power King	divider-power-king	Other Electronics & Accessories	pcs	1	750.00	863.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.423	2026-02-02 10:32:46.423
dcb6ba58-ce65-4294-bf31-7a20bf8f7a52	Divider Sine 4port	divider-sine-4port	Other Electronics & Accessories	pcs	1	1150.00	1323.00	10	8	\N	\N	\N	t	f	2026-02-02 10:32:46.426	2026-02-02 10:32:46.426
af048db6-ffcb-4160-9793-576ec6aa5459	Divider 25m	divider-25m	Other Electronics & Accessories	pcs	1	9500.00	10925.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.429	2026-02-02 10:32:46.429
6787fca5-e572-49ba-b070-a31329a7bbc7	Divider Sine 5port	divider-sine-5port	Other Electronics & Accessories	pcs	1	1350.00	1553.00	10	13	\N	\N	\N	t	f	2026-02-02 10:32:46.432	2026-02-02 10:32:46.432
3e79b71e-fd20-446b-b656-2aff9805fb6e	Ventillator For Roff	ventillator-for-roff	Other Electronics & Accessories	pcs	1	5500.00	6325.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.435	2026-02-02 10:32:46.435
57cca944-c1b0-4458-b04a-731736644451	Gato glories 3000VA	gato-glories-3000va	Other Electronics & Accessories	pcs	1	19500.00	22425.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.437	2026-02-02 10:32:46.437
c3a4947f-c73c-42f1-8763-e0e8bda3841b	Satabilizer Gato 1500VA	satabilizer-gato-1500va	Other Electronics & Accessories	pcs	1	4300.00	4945.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.445	2026-02-02 10:32:46.445
0e7ecc9c-7334-4e9a-b128-027de6634264	Satabilizer Gato 1000VA	satabilizer-gato-1000va	Other Electronics & Accessories	pcs	1	3400.00	3910.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.448	2026-02-02 10:32:46.448
67ff2ded-7063-4e07-9675-22ed8739bc4e	Ups Battery mini	ups-battery-mini	Other Electronics & Accessories	pcs	1	3500.00	4025.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.451	2026-02-02 10:32:46.451
64bbc285-fae5-4665-b02b-356557389956	UPS Battery 7V 9A small	ups-battery-7v-9a-small	Other Electronics & Accessories	pcs	1	2500.00	2875.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.454	2026-02-02 10:32:46.454
d910a93f-771b-4aa3-8b31-c5327f7715ba	UPS Battery 9V 12A	ups-battery-9v-12a	Other Electronics & Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.456	2026-02-02 10:32:46.456
88827f83-3068-47ee-8d5b-7f3e536f2305	C - Size Battery	c-size-battery	Other Electronics & Accessories	pcs	1	0.00	0.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.458	2026-02-02 10:32:46.458
d4b0f9c9-8b4c-4ab5-89f4-cd20a3b15262	17A Toner Any	17a-toner-any	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.552	2026-02-02 10:32:46.552
b99ec6db-b63b-4036-8659-92fd8e44e115	Drum unit 19A	drum-unit-19a	Toner & Ink Supplies	pcs	1	1950.00	2243.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.555	2026-02-02 10:32:46.555
e62d544e-8092-4e11-8909-a564a4d118a7	59A Toner Any with out chip	59a-toner-any-with-out-chip	Toner & Ink Supplies	pcs	1	3600.00	4140.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.557	2026-02-02 10:32:46.557
d8b04dee-ccc0-426e-822d-c4c500d6a647	305A Toner Any	305a-toner-any	Toner & Ink Supplies	pcs	1	3600.00	4140.00	10	8	\N	\N	\N	t	f	2026-02-02 10:32:46.56	2026-02-02 10:32:46.56
be8d297c-b81a-4be9-86b9-39a3bb812ffd	151A Toner no chip	151a-toner-no-chip	Toner & Ink Supplies	pcs	1	3600.00	4140.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.563	2026-02-02 10:32:46.563
45344e0f-6b29-471f-b257-4596cec032e5	Mx-315	mx-315	Toner & Ink Supplies	pcs	1	3450.00	3968.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.566	2026-02-02 10:32:46.566
a447d1c0-1496-4dc3-a757-c3796c869d1e	Tn 3417 toner	tn-3417-toner	Toner & Ink Supplies	pcs	1	2350.00	2703.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.569	2026-02-02 10:32:46.569
f00ba684-fd38-4df8-93e3-cf6382c46909	Tk 6325	tk-6325	Toner & Ink Supplies	pcs	1	3300.00	3795.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.572	2026-02-02 10:32:46.572
406a968e-8a0d-427d-8745-2eefe451ba8e	Tk- 3160	tk-3160	Toner & Ink Supplies	pcs	1	1850.00	2128.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.574	2026-02-02 10:32:46.574
6ef3ab7c-8a66-4b2b-b795-1823249202fa	Tk- 4105	tk-4105	Toner & Ink Supplies	pcs	1	3250.00	3738.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.577	2026-02-02 10:32:46.577
97c0371c-9245-4947-be66-755ebbaa338d	15A Toner NANODAS	15a-toner-nanodas	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.58	2026-02-02 10:32:46.58
571565c6-ec58-4720-81e0-c2ff230ae295	85A Toner NANODAS	85a-toner-nanodas	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.583	2026-02-02 10:32:46.583
6e999108-cf80-426c-aefe-c794847ac9e4	83A Toner any	83a-toner-any	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.586	2026-02-02 10:32:46.586
2a180763-c7ff-41e0-b626-07ae5e031c34	05A Toner Any	05a-toner-any	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.589	2026-02-02 10:32:46.589
0d568669-7da5-418a-970f-fd125c52bf08	05A Toner hp	05a-toner-hp	Toner & Ink Supplies	pcs	1	1850.00	2128.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:46.593	2026-02-02 10:32:46.593
a808176f-82cf-4a46-a9a0-50ccf8dc924d	53A Toner genius	53a-toner-genius	Toner & Ink Supplies	pcs	1	2200.00	2530.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.596	2026-02-02 10:32:46.596
abc68e86-5212-4ad1-957b-2305d5c74575	hp laptop cur i5 12th generation 8/512	\N	Machinery	pcs	1	97750.00	110000.00	10	1	\N	\N	\N	f	f	2026-02-04 11:18:15.012	2026-02-04 11:18:15.012
1689b10d-c6af-4771-b78e-0e54a0c84471	106A Toner Any	106a-toner-any	Toner & Ink Supplies	pcs	1	2600.00	2990.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.599	2026-02-02 10:32:46.599
f6df5905-3201-4481-a132-85532bc81b73	107A Toner Any	107a-toner-any	Toner & Ink Supplies	pcs	1	2600.00	2990.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:46.601	2026-02-02 10:32:46.601
91dc15c2-c867-46a9-8dc0-5102bb40bc54	725A Toner Any	725a-toner-any	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.602	2026-02-02 10:32:46.602
71130377-0c9c-487d-a6c2-96e33c982ce5	728A Toner Any	728a-toner-any	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.605	2026-02-02 10:32:46.605
14062665-be8d-4d54-a91c-23e4cefccade	Master 7608	master-7608	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	10	\N	\N	\N	t	f	2026-02-02 10:32:46.608	2026-02-02 10:32:46.608
fd1921fd-e1a8-45da-a137-f4644082ed8a	Master 4363	master-4363	Toner & Ink Supplies	pcs	1	1600.00	1840.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.61	2026-02-02 10:32:46.61
dbb32f2b-65fa-438e-87b4-52ed42e7b5e0	lex mark 410 Toner	lex-mark-410-toner	Toner & Ink Supplies	pcs	1	2800.00	3220.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.614	2026-02-02 10:32:46.614
3eae3eed-fb49-4adb-949b-6f9ee061e5a7	Hikvission NVR 8 channel	\N	Other Electronics & Accessories	pcs	1	21850.00	33000.00	10	1	\N	\N	\N	f	f	2026-02-05 07:17:14.746	2026-02-05 07:17:14.746
8ff630fa-0539-4b86-a850-eae245ac00c3	Haif Mesh Split Char Black Metal	\N	Furniture	pcs	1	12000.00	15000.00	10	3	\N	\N	\N	f	f	2026-02-05 07:32:28.196	2026-02-05 07:32:28.196
8ceabf1d-d4b2-47db-9c5e-9b0b05e28007	Egronomic Whit Chair	\N	Furniture	pcs	1	29000.00	35000.00	10	1	\N	\N	\N	f	f	2026-02-05 07:35:40.054	2026-02-05 07:35:40.054
9d3db322-87f0-407c-8d91-1f504dd0969f	Laptop Bag Tubing	\N	Computer Accessories	pcs	1	5865.00	7500.00	10	5	\N	\N	\N	f	f	2026-02-05 08:41:36.441	2026-02-05 08:41:36.441
99a286d3-959b-46f5-b292-b984cd13a8bd	Toner With chip 59A	\N	Toner & Ink Supplies	pcs	1	4025.00	6000.00	10	3	\N	\N	\N	f	f	2026-02-05 08:43:25.204	2026-02-05 08:43:25.204
d2e1d795-ad2b-45f2-8990-e6d965173d28	Dell Desktop Computer coi5 8/512	\N	Machinery	pcs	1	135000.00	162000.00	10	-1	\N	\N	\N	f	f	2026-02-05 07:19:41.94	2026-02-23 13:52:40.612
cb852bac-1c7d-412f-b1c5-502aace63043	Telephone box Ethiotelecom	telephone-box-ethiotelecom	Computer Accessories	pcs	1	2300.00	2645.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:45.571	2026-02-24 10:42:25.527
6d352ab0-cd0b-4d39-8bde-9cf8993c5d50	Media converter Multi Mode 		Computer Accessories	pcs	1	6325.00	8500.00	10	2		\N	\N	f	f	2026-02-04 11:15:38.379	2026-02-27 12:15:30.335
2d91c476-a2ee-48e9-beca-a6291c024bac	Half mesh ergnoromic chair	half-mesh-ergnoromic-chair	Furniture	pcs	1	11000.00	12650.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.459	2026-02-02 10:32:46.459
24f7510f-7818-4938-bd97-6c2552c3cc74	Seceretorial Half mesh chair	seceretorial-half-mesh-chair	Furniture	pcs	1	9800.00	11270.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.486	2026-02-02 10:32:46.486
1f8d1a11-950d-4e7e-a27f-5b497ab1cdbf	26A Toner Any	26a-toner-any	Toner & Ink Supplies	pcs	1	2150.00	2473.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.489	2026-02-02 10:32:46.489
b2f4ac11-1d65-4beb-9435-c32a1d415d86	26A Toner premium	26a-toner-premium	Toner & Ink Supplies	pcs	1	2150.00	2473.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.492	2026-02-02 10:32:46.492
eadcd941-1be9-41f2-82bb-300d3850134d	FX-3 Toner	fx-3-toner	Toner & Ink Supplies	pcs	1	1950.00	2243.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.495	2026-02-02 10:32:46.495
61d60445-bae8-4fe3-9d4c-24e1bb955678	FX-10 Toner	fx-10-toner	Toner & Ink Supplies	pcs	1	1950.00	2243.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.498	2026-02-02 10:32:46.498
425e7cc4-dc59-47ca-a4ce-52de12fc3bdd	C-EXV 14 Toner	c-exv-14-toner	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:46.501	2026-02-02 10:32:46.501
6c093fbc-d6f8-457a-8f90-3abb01d28c1a	C-EXV 60 Toner	c-exv-60-toner	Toner & Ink Supplies	pcs	1	1250.00	1438.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.504	2026-02-02 10:32:46.504
61a64c00-25ca-4a51-ba7c-3ff4bf33fec3	C-EXV 42 Toner	c-exv-42-toner	Toner & Ink Supplies	pcs	1	1050.00	1208.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.508	2026-02-02 10:32:46.508
304c8bd6-63bb-48c7-a21d-3dd9a9a979b6	C-EXV 33 Toner	c-exv-33-toner	Toner & Ink Supplies	pcs	1	1350.00	1553.00	10	9	\N	\N	\N	t	f	2026-02-02 10:32:46.51	2026-02-02 10:32:46.51
3835bbb8-dd2f-436b-940c-88ce3f70dc5e	GPR-18 Toner	gpr-18-toner	Toner & Ink Supplies	pcs	1	950.00	1093.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.513	2026-02-02 10:32:46.513
d7e2cca1-7fd2-4264-ba3d-9d6a5bd8c10e	Hard disk 2Tb serviliance 	\N	Computer Accessories	pcs	1	10350.00	17000.00	10	1	\N	\N	\N	f	f	2026-02-05 07:13:22.513	2026-02-05 07:13:22.513
7c242ca0-4055-4454-bb27-f347054fd76e	Canon Ink	canon-ink	Toner & Ink Supplies	pcs	1	3000.00	3450.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.516	2026-02-02 10:32:46.516
a6b66ece-689a-48b9-bf72-ac08604afaa4	Toner 85a any toner	toner-85a-any-toner	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.519	2026-02-02 10:32:46.519
91e504ca-03f1-4304-9d0a-c457df357788	Epson ink 70ml Anytoner	epson-ink-70ml-anytoner	Toner & Ink Supplies	pcs	1	1600.00	1840.00	10	6	\N	\N	\N	t	f	2026-02-02 10:32:46.522	2026-02-02 10:32:46.522
9114b74b-8f46-4f14-878e-6944987ee190	Epson ink 70ml normal	epson-ink-70ml-normal	Toner & Ink Supplies	pcs	1	1400.00	1610.00	10	15	\N	\N	\N	t	f	2026-02-02 10:32:46.525	2026-02-02 10:32:46.525
dcd03dfe-b188-4d32-a461-7651c3bb89b4	Poweder1kg Gold	poweder1kg-gold	Toner & Ink Supplies	pcs	1	1300.00	1495.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.528	2026-02-02 10:32:46.528
d788f4fb-9080-4eb9-a1a6-72451f949889	Poweder1kg Elu	poweder1kg-elu	Toner & Ink Supplies	pcs	1	1300.00	1495.00	10	5	\N	\N	\N	t	f	2026-02-02 10:32:46.533	2026-02-02 10:32:46.533
92a78937-111a-4689-8d4a-35635814a1da	Genies 80A	genies-80a	Toner & Ink Supplies	pcs	1	1750.00	2013.00	10	4	\N	\N	\N	t	f	2026-02-02 10:32:46.535	2026-02-02 10:32:46.535
108092ad-ee60-4e08-a840-a40475406920	Genies 49A	genies-49a	Toner & Ink Supplies	pcs	1	2000.00	2300.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.538	2026-02-02 10:32:46.538
682fde8e-865d-4c93-8769-a2ba8f91df70	12A Toner Any	12a-toner-any	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.541	2026-02-02 10:32:46.541
4dd14f80-b299-4e7b-8c3a-1472e21957ca	80A Toner Any	80a-toner-any	Toner & Ink Supplies	pcs	1	1900.00	2185.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:46.544	2026-02-02 10:32:46.544
86300ff1-3cf6-4ff9-a739-791ecdf7c99f	80A Toner hp	80a-toner-hp	Toner & Ink Supplies	pcs	1	1850.00	2128.00	10	3	\N	\N	\N	t	f	2026-02-02 10:32:46.546	2026-02-02 10:32:46.546
04d9d51c-c68c-4654-98b3-aecb0d390fd8	37A Toner Any	37a-toner-any	Toner & Ink Supplies	pcs	1	5400.00	6210.00	10	1	\N	\N	\N	t	f	2026-02-02 10:32:46.549	2026-02-02 10:32:46.549
3701f253-1e86-4138-914e-8101c991954b	Hard disk 1TB For Desik top	\N	Computer Accessories	pcs	1	7475.00	9000.00	10	3	\N	\N	\N	f	f	2026-02-05 07:24:11.781	2026-02-05 07:24:11.781
4b0d5470-c72b-4664-93b0-a47be41e913d	Laptop Bag Nomal	\N	Other Electronics & Accessories	pcs	1	402.00	600.00	10	3	\N	\N	\N	f	f	2026-02-05 07:28:15.907	2026-02-05 07:28:15.907
47c0330a-4659-478a-a9a9-bbdfa4f7a5fa	Egronomic Chair Big	\N	Furniture	pcs	1	24000.00	31000.00	10	1	\N	\N	\N	f	f	2026-02-05 08:35:37.019	2026-02-05 08:35:37.019
b117c146-57f2-49cc-8830-5ca52af39dd7	Managerial Full Mesh Chair Black	\N	Furniture	pcs	1	28000.00	34000.00	10	1	\N	\N	\N	f	f	2026-02-05 08:37:27.461	2026-02-05 08:37:27.461
7fdda702-39e9-4ffb-8416-e4fe9285fc83	Epson L3250 Color Pinter	\N	Machinery	pcs	1	42211.00	47300.00	10	2	\N	\N	\N	f	f	2026-02-05 08:39:03.535	2026-02-05 08:39:03.535
15b49a04-2606-479a-ab7c-20f0a0384860	Laptop Bag Noxia	\N	Computer Accessories	pcs	1	4720.00	6500.00	10	5	\N	\N	\N	f	f	2026-02-05 08:42:32.369	2026-02-05 08:42:32.369
9da927d3-e7c9-4229-8d82-6212e22c58cc	Life Bouy 70gm	\N	Sanitory	pcs	1	48.50	68.00	10	1	\N	\N	\N	f	f	2026-02-23 14:24:08.28	2026-02-23 14:24:08.28
0a8c0873-c898-4091-a106-b3d21c41a88a	Epson Lcd Projector EB X 49	\N	Machinery	pcs	1	122000.00	100000.00	10	1	\N	\N	\N	f	f	2026-02-24 12:36:46.365	2026-02-24 12:36:46.365
1c9408e9-07ca-40f9-a452-4f70d5105af2	Wall OutLet Double 	\N	Networking Accessories	pcs	1	580.00	850.00	10	50	\N	\N	\N	f	f	2026-02-24 12:38:01.428	2026-02-24 12:38:01.428
ad3338f8-fa47-42eb-9483-84426ac1d09d	Life Bouy 150gm	\N	Sanitory	pcs	1	104.00	130.00	10	39	\N	\N	\N	f	f	2026-02-23 14:27:19.2	2026-02-23 14:30:43.939
098073c3-e25f-4c46-af47-1fa60918f048	Half mesh Chair Metal	\N	Furniture	pcs	1	12000.00	15500.00	10	3	\N	\N	\N	f	f	2026-02-24 12:17:36.364	2026-02-24 12:17:36.364
ad0702f7-3c32-44f2-82fc-be89031a36f4	Toner 106A	\N	Toner & Ink Supplies	pcs	1	2530.00	3200.00	10	5	\N	\N	\N	f	f	2026-02-24 12:26:33.68	2026-02-24 12:26:33.68
9bf931ec-2899-4e59-a4f6-b4b9f9626e16	Toner 107A	\N	Toner & Ink Supplies	pcs	1	2530.00	3200.00	10	5	\N	\N	\N	f	f	2026-02-24 12:27:39.217	2026-02-24 12:27:39.217
f00c05ad-0bc7-4e18-b67d-d9f804d7fd6a	Tv smart Super fine 55inch	\N	Machinery	pcs	1	72500.00	82000.00	10	1	\N	\N	\N	f	f	2026-02-24 12:28:44.461	2026-02-24 12:28:44.461
79bd2853-aaa3-462c-a7c5-6bf10b692e88	Hikvission NVR 16 Channle	\N	Networking Accessories	pcs	1	49450.00	58000.00	10	1	\N	\N	\N	f	f	2026-02-24 12:30:39.765	2026-02-24 12:30:39.765
bd41bad6-2f01-4611-b827-ee04c8b518f8	Dell Desktop Computer Cori5 14th Generation RAM 8GB ssd 512	\N	Machinery	pcs	1	135000.00	150000.00	10	2	\N	\N	\N	f	f	2026-02-24 12:32:46.851	2026-02-24 12:32:46.851
ff024bb5-4c61-4cc0-9f6a-132994e67879	UPS Tecnoware 1200VA	\N	Machinery	pcs	1	19000.00	24000.00	10	2	\N	\N	\N	f	f	2026-02-24 12:33:59.423	2026-02-24 12:33:59.423
e49c7540-8264-4368-9529-41b62ee1c54c	Canon Printer 3410 	\N	Machinery	pcs	1	34000.00	40000.00	10	2	\N	\N	\N	f	f	2026-02-24 12:34:49.42	2026-02-24 12:34:49.42
ee147eca-04eb-42c2-a7dc-e04637b8f00d	Hp Scan Jet 2600F1	\N	Machinery	pcs	1	63000.00	70000.00	10	3	\N	\N	\N	f	f	2026-02-24 12:35:50.627	2026-02-24 12:35:50.627
478d3f16-0d5c-4f55-ab92-66b71aafce85	Wall Out Let Single	\N	Networking Accessories	pcs	1	480.00	700.00	10	50	\N	\N	\N	f	f	2026-02-24 12:39:16.377	2026-02-24 12:39:16.377
5ec0c037-5ca7-41db-a45a-d7480bb8849f	Flash C type 128GB 	\N	Other Electronics & Accessories	pcs	1	1725.00	2400.00	10	10	\N	\N	\N	f	f	2026-02-24 12:40:30.635	2026-02-24 12:40:30.635
2d4cb7cc-cfc6-43ad-aa47-c2d269321739	Flash T_Max 64Gb	\N	Other Electronics & Accessories	pcs	1	1081.00	1600.00	10	10	\N	\N	\N	f	f	2026-02-24 12:42:02.833	2026-02-24 12:42:02.833
27653c29-73f8-4219-891c-c91fe2c1fb24	Flash T|Max 128G	\N	Other Electronics & Accessories	pcs	1	1633.00	2400.00	10	10	\N	\N	\N	f	f	2026-02-24 12:45:48.891	2026-02-24 12:45:48.891
a262ae8a-91de-4057-932a-40ef78a8e9cd	Flash T Max 32Gb	\N	Other Electronics & Accessories	pcs	1	851.00	1200.00	10	10	\N	\N	\N	f	f	2026-02-24 12:46:40.982	2026-02-24 12:46:40.982
4a91ecdc-027a-4a2f-b6d1-7c66fd4f16f8	Life Bouy Saop 150Gm	\N	Sanitory	pak	10	3708.00	4160.00	10	10	\N	\N	\N	f	f	2026-02-24 13:00:26.105	2026-02-24 13:00:26.105
0de8b8b2-71ce-434e-a1ae-9406ed935ba1	Full Mesh Chair White	\N	Furniture	pcs	1	29000.00	38000.00	10	3	\N	\N	\N	f	f	2026-02-24 13:03:33.718	2026-02-24 13:03:33.718
ccd0d38b-205f-42ae-a15a-5a47a85bd761	UPS Intex 1500VA	\N	Machinery	pcs	1	23000.00	27000.00	10	2	\N	\N	\N	f	f	2026-02-24 13:04:29.12	2026-02-24 13:04:29.12
963c39c1-49f8-4d2f-b51a-9768488cd9f8	UPS Smart Combo 1500VA	\N	Machinery	pcs	1	28000.00	33000.00	10	2	\N	\N	\N	f	f	2026-02-24 13:05:30.067	2026-02-24 13:05:30.067
7513ef89-ae41-4690-9b84-f3c129f2c53b	Color Printer Epson 3250	\N	Machinery	pcs	1	42211.00	49000.00	10	5	\N	\N	\N	f	f	2026-02-24 13:06:32.956	2026-02-24 13:06:32.956
1af0e2f0-088a-456f-a301-137ffba4c2df	Canon Laser Jet 3010 print scan Copy	\N	Machinery	pcs	1	46000.00	52000.00	10	3	\N	\N	\N	f	f	2026-02-24 13:08:15.346	2026-02-24 13:08:15.346
3be89360-dfc6-43c2-9b0d-33051f8359cf	Tv Smart Super Fine 55inch	\N	Machinery	pcs	1	75000.00	83000.00	10	2	\N	\N	\N	f	f	2026-02-24 13:09:17.084	2026-02-24 13:09:17.084
6368f3a1-774d-40d3-bb38-914288e12a51	Tv Smart Super Fine 65inch	\N	Machinery	pcs	1	98500.00	109000.00	10	1	\N	\N	\N	f	f	2026-02-24 13:10:17.725	2026-02-24 13:10:17.725
9defd86f-a91f-4076-8b76-749cec81f596	Samsung Galaxy Tab A9 Ram 4Gb Storage 64	\N	Machinery	pcs	1	34500.00	39500.00	10	3	\N	\N	\N	f	f	2026-02-24 13:11:36.672	2026-02-24 13:11:36.672
bbb3eaa7-ccb3-4fe8-9041-61e5af904083	Hp Laptop Cori5 12th Generattion Ram 8Gb SSd 512 Pavilion 14inch	\N	Machinery	pcs	1	109250.00	118000.00	10	2	\N	\N	\N	f	f	2026-02-24 13:13:01.33	2026-02-24 13:13:01.33
7547da4d-43b8-487b-97b5-002630eb5d25	Hp Laptop Cori5 11th Generation Ram 8Gb Ssd 512 Elitebook 14inch	\N	Machinery	pcs	1	74750.00	86000.00	10	2	\N	\N	\N	f	f	2026-02-24 13:14:34.327	2026-02-24 13:14:34.327
53041288-2568-48ec-a288-68cb67f10e3d	Tp Link Wifi ADSL+ Router	\N	Networking Accessories	pcs	1	6325.00	7500.00	10	1	\N	\N	\N	f	f	2026-02-24 13:15:45.856	2026-02-24 13:15:45.856
851f6621-566f-44cb-ae85-b2faf1a8458f	External Hard Disk W.D 1TB	\N	Computer Accessories	pcs	1	10925.00	14500.00	10	2	\N	\N	\N	f	f	2026-02-24 13:16:52.467	2026-02-24 13:16:52.467
e5bdbbd2-3122-4730-8c98-1a7f6cbc2502	Web Cam Camera 930	\N	Other Electronics & Accessories	pcs	1	29900.00	34900.00	10	1	\N	\N	\N	f	f	2026-02-24 13:19:12.861	2026-02-24 13:19:12.861
f99ff96a-c841-418c-9810-75ab204f031c	Divider BAB Astra	\N	Other Electronics & Accessories	pcs	1	800.00	1200.00	10	5	\N	\N	\N	f	f	2026-02-24 13:20:12.356	2026-02-24 13:20:12.356
04cba6e9-70d1-4192-947d-db2e6bbfaf82	Dell Desktop Computer Cori5 14th Generation Ram 8gb SSd 512	\N	Machinery	pcs	1	135000.00	150000.00	10	2	\N	\N	\N	f	f	2026-02-24 13:21:20.44	2026-02-24 13:21:20.44
e4d9483a-2418-4e4d-8392-1d1f06d69244	Hp Scan Jet 2600F1	\N	Machinery	pcs	1	63000.00	70000.00	10	2	\N	\N	\N	f	f	2026-02-24 13:27:21.246	2026-02-24 13:27:21.246
a48f9fab-91ad-4b15-8f36-815a945425e1	Office Table 1.20M	\N	Furniture	pcs	1	12500.00	17500.00	10	3	\N	\N	\N	f	f	2026-02-24 13:28:21.101	2026-02-24 13:28:21.101
219df1d4-022c-4118-889d-54064190ce60	Stablizer AVR 1500VA	\N	Other Electronics & Accessories	pcs	1	4800.00	6000.00	10	4	\N	\N	\N	f	f	2026-02-24 13:30:29.282	2026-02-24 13:30:29.282
6964464b-2212-4406-92bb-098b11b7fc60	Staples Kangaro	\N	Stationery Items	pak	10	760.00	1300.00	10	10	\N	\N	\N	f	f	2026-02-24 13:33:45.445	2026-02-24 13:33:45.445
79fd5058-7547-4044-92ec-a49daa54dfd7	Fluid Pen	\N	Stationery Items	pak	10	600.00	1100.00	10	2	\N	\N	\N	f	f	2026-02-24 13:34:41.276	2026-02-24 13:34:41.276
c845590d-4fc5-4f05-b233-995fc1036e06	Uhu	\N	Stationery Items	pak	10	1200.00	2000.00	10	3	\N	\N	\N	f	f	2026-02-24 13:36:40.793	2026-02-24 13:36:40.793
2d7855b4-8796-4546-b3cc-374d25d59769	Carbo 3000H	\N	Stationery Items	reem	500	1000.00	1200.00	10	10	\N	\N	\N	f	f	2026-02-24 13:37:23.565	2026-02-24 13:37:23.565
b54e1d8e-a389-4aef-a6a8-19aa2280c598	Guest Chair U leg	\N	Furniture	pcs	1	8700.00	14000.00	10	10	\N	\N	\N	f	f	2026-02-24 13:38:21.848	2026-02-24 13:38:21.848
beea1235-2a6e-4a24-86b7-12968ddfd40e	Guest Chair Aluminum 3Seter	\N	Furniture	pcs	1	21000.00	30000.00	10	2	\N	\N	\N	f	f	2026-02-24 13:39:14.464	2026-02-24 13:39:14.464
6b277386-3b71-41ce-b732-0cd7d2eafb62	Bic Pen Black 	\N	Stationery Items	pcs	1	1100.00	1400.00	10	10	\N	\N	\N	f	f	2026-02-24 13:40:56.426	2026-02-24 13:40:56.426
6ae5e16b-d448-47f6-a28e-9bca25bd9b19	Bic Pen Blue	\N	Stationery Items	pcs	1	1100.00	1400.00	10	10	\N	\N	\N	f	f	2026-02-24 13:41:48.25	2026-02-24 13:41:48.25
3f915754-d14f-4bf2-8593-87031c761d1b	Stapler DES 335	\N	Furniture	pcs	1	650.00	900.00	10	10	\N	\N	\N	f	f	2026-02-24 13:42:48.693	2026-02-24 13:42:48.693
4fd66a8b-54a1-438c-bc75-1bea21825857	Registration Book Local	\N	Stationery Items	pcs	1	700.00	1000.00	10	6	\N	\N	\N	f	f	2026-02-24 13:44:08.558	2026-02-24 13:44:08.558
629ef940-1686-423e-a056-b71ebdb5b41d	Computer Tabel 1.20	\N	Furniture	pcs	1	14500.00	20000.00	10	3	\N	\N	\N	f	f	2026-02-24 13:59:47.922	2026-02-24 13:59:47.922
dc2516de-85b3-431e-9936-1a6f49376ca1	Book Shelf 3 door	\N	Furniture	pcs	1	37450.00	44500.00	10	2	\N	\N	\N	f	f	2026-02-24 14:02:09.042	2026-02-24 14:02:09.042
f5b9febd-59d9-4c86-a1a4-10f266b27809	Managerial L.Shepe teble 2m 	\N	Furniture	pcs	1	49500.00	55000.00	10	2	\N	\N	\N	f	f	2026-02-24 14:07:36.007	2026-02-24 14:07:36.007
3aa0ddbb-af20-45c2-bf3f-31832f1065b3	Secratori Chair	\N	Furniture	pcs	1	7400.00	13000.00	10	6	\N	\N	\N	f	f	2026-02-24 14:10:12.179	2026-02-24 14:10:12.179
b2be0ef3-45f6-476b-ba97-8b1feee18955	Secratori Chair	\N	Furniture	pcs	1	7400.00	13000.00	10	6	\N	\N	\N	f	f	2026-02-24 14:11:08.162	2026-02-24 14:11:08.162
6964e1ab-68f2-46d6-bee7-c15cf6e3e463	Secratori Chair	\N	Furniture	pcs	1	7400.00	13000.00	10	6	\N	\N	\N	f	f	2026-02-24 14:12:12.118	2026-02-24 14:12:12.118
1d29ecf0-7c00-4864-a733-d4dbd2899859	Double AA paper	\N	Stationery Items	pcs	1	5000.00	6000.00	10	10	\N	\N	\N	f	f	2026-02-24 14:15:25.778	2026-02-24 14:15:25.778
6640dd48-1e9d-4f8c-9b38-2ec1820d5f9d	Confrance Table 4m	\N	Furniture	pcs	1	29500.00	190000.00	10	2	\N	\N	\N	f	f	2026-02-24 14:17:54.378	2026-02-24 14:17:54.378
1f70fbbe-e27a-45e3-a7a3-2574e3670efa	Confrance Table 4m	\N	Furniture	pcs	1	29500.00	190000.00	10	2	\N	\N	\N	f	f	2026-02-24 14:18:14.579	2026-02-24 14:18:14.579
2ede1204-2cf8-461b-9a8f-c2f803e01ed0	Confrance Table 4m	\N	Furniture	pcs	1	29500.00	190000.00	10	2	\N	\N	\N	f	f	2026-02-24 14:18:47.945	2026-02-24 14:18:47.945
fe9b0349-ee6c-466c-a99c-48710e5a1c8a	Confrance Table 4m	\N	Furniture	pcs	1	29500.00	190000.00	10	2	\N	\N	\N	f	f	2026-02-24 14:19:30.271	2026-02-24 14:19:30.271
d8fb7f53-913b-4f48-a9e6-caf67e65357d	Confrance Table 4m	\N	Furniture	pcs	1	29500.00	190000.00	10	2	\N	\N	\N	f	f	2026-02-24 14:19:31.3	2026-02-24 14:19:31.3
a07fe944-30ac-4a35-9548-156385af748d	Confrance Table 4m	\N	Furniture	pcs	1	29500.00	190000.00	10	2	\N	\N	\N	f	f	2026-02-24 14:19:31.687	2026-02-24 14:19:31.687
90541cf9-c7f5-468e-8ebf-49a4f88fde3f	Toner 05A	\N	Toner & Ink Supplies	pcs	1	2185.00	2800.00	10	5	\N	\N	\N	f	f	2026-02-24 14:26:51.938	2026-02-24 14:26:51.938
b9cd9b0a-a1fd-475b-8bb1-bb1d5026566b	Toner 725A	\N	Toner & Ink Supplies	pcs	1	2415.00	3500.00	10	5	\N	\N	\N	f	f	2026-02-24 14:41:03.653	2026-02-24 14:41:03.653
7e0e9561-84ea-47c8-a9e8-86b7656aa99e	Book Shelf 2Door	\N	Furniture	pcs	1	26900.00	34000.00	10	1	\N	\N	\N	f	f	2026-02-24 14:04:19.272	2026-02-27 12:28:18.393
e005f819-e598-4435-83c6-5ea8b084b0b5	Secratori Chair	\N	Furniture	pcs	1	7400.00	13000.00	10	0	\N	\N	\N	f	f	2026-02-24 14:10:37.849	2026-02-27 12:34:09.413
37d64b37-9426-4f69-b049-ff8ea08309ba	Computer Table 1.20	\N	Furniture	pcs	1	15500.00	21000.00	10	0	\N	\N	\N	f	f	2026-02-24 13:57:11.746	2026-02-27 12:54:25.814
412d98a7-b8a6-4fa8-b005-07fcab7a2f1b	Toner 85A	\N	Toner & Ink Supplies	pcs	1	2012.00	2400.00	10	5	\N	\N	\N	f	f	2026-02-24 14:44:09.654	2026-02-24 14:44:09.654
9167412f-d10b-4c27-91a6-47f81d3510f5	Toner 85A	\N	Toner & Ink Supplies	pcs	1	2012.00	2400.00	10	5	\N	\N	\N	f	f	2026-02-24 14:46:45.213	2026-02-24 14:46:45.213
bdbf3d27-b503-42ba-bffc-a7a0a93b4b3d	Dell mouse wired	dell-mouse-wired	Computer Accessories	pcs	1	250.00	500.00	10	0		\N	\N	t	f	2026-02-02 10:32:45.761	2026-02-25 11:11:11.737
4a7ded25-8979-44f4-b175-2123438ccbea	Computer Table 1.20	\N	Furniture	pcs	1	14500.00	20000.00	10	0	\N	\N	\N	f	f	2026-02-24 13:53:34.68	2026-02-25 17:07:32.457
b3a49447-a019-49c9-8692-c76239c9ced1	Hp wireless Mouse chargable	hp-wireless-mouse-chargable	Computer Accessories	pcs	1	1050.00	1208.00	10	2	\N	\N	\N	t	f	2026-02-02 10:32:45.851	2026-02-27 08:16:50.966
0db1735a-c6e2-4bb8-8c41-ce08edac9855	Filud pen	filud-pen	Stationery Items	pcs	1	120.00	138.00	10	0	\N	\N	\N	t	f	2026-02-02 10:32:45.988	2026-02-27 09:10:54.725
e0f4a0cd-3acc-414e-b430-62447c5bba2e	Lenevo Desktop Computer Cori3 10th Ram 4GB Hdd 1Tb 	\N	Machinery	pcs	1	86000.00	96000.00	10	2	\N	\N	\N	f	f	2026-02-27 11:14:56.072	2026-02-27 11:14:56.072
bac83f44-8d13-4197-9cb7-298a52f4f424	HDMI Cable 10m	\N	Computer Accessories	pcs	1	1495.00	2600.00	10	5	\N	\N	\N	f	f	2026-02-27 11:20:44.862	2026-02-27 11:20:44.862
e05eeb28-226b-4586-a974-709dc75637cc	HDMI cable	\N	Computer Accessories	pcs	1	550.00	950.00	10	5	\N	\N	\N	f	f	2026-02-27 11:23:39.954	2026-02-27 11:23:39.954
979c4522-47de-4271-b593-e82c09415902	HDMI Cable 1.5	\N	Computer Accessories	pcs	1	172.00	250.00	10	5	\N	\N	\N	f	f	2026-02-27 11:27:05.131	2026-02-27 11:27:05.131
dc49704c-e69a-42c6-a835-b70c4aa59ee9	External hardesik 1TBWD	\N	Computer Accessories	pcs	1	10925.00	15000.00	10	3	\N	\N	\N	f	f	2026-02-27 11:29:40.862	2026-02-27 11:29:40.862
516bb920-99b5-440b-9c42-5042d2765329	Swich D'link 24 port	\N	Networking Accessories	pcs	1	16100.00	18200.00	10	2	\N	\N	\N	f	f	2026-02-27 11:31:32.036	2026-02-27 11:31:32.036
bcbcc94f-e100-4e2d-a152-c9a9dbc5caa9	Dell Desktop computer cor i5 6th 8/500hdd	\N	Machinery	pcs	1	44000.00	52000.00	10	3	\N	\N	\N	f	f	2026-02-27 11:35:24.811	2026-02-27 11:35:24.811
132edc70-d8a6-4137-9763-e53480643def	Dell Desik top computer cor i5 6th 4/1TB	\N	Machinery	pcs	1	44000.00	52000.00	10	1	\N	\N	\N	f	f	2026-02-27 11:37:03.329	2026-02-27 11:37:03.329
2d50b420-f8cc-47dd-b357-576c994cbe54	Dell Desiktop cot i5 7th RAM 8GB HDD1TB	\N	Machinery	pcs	1	48000.00	56000.00	10	1	\N	\N	\N	f	f	2026-02-27 11:39:10.874	2026-02-27 11:39:10.874
ed1d15c5-2a9b-4dec-a80a-e53486034e44	HP Desiktop cor i5 6th RAM 4GB HDD500GB	\N	Machinery	pcs	1	40000.00	48000.00	10	2	\N	\N	\N	f	f	2026-02-27 11:41:04.917	2026-02-27 11:41:04.917
2491ec53-8e0e-4420-98d5-0ec96b9af41e	Dell Desiktop 7th Cor i5 RAM 8GB HDD 500GB	\N	Machinery	pcs	1	48000.00	56000.00	10	1	\N	\N	\N	f	f	2026-02-27 11:42:47.634	2026-02-27 11:42:47.634
59c89517-526f-4b46-9470-bded8bbb204d	Dell Desiktpo Computer cor i5 6th RAM 8GB HDD1TB	\N	Machinery	pcs	1	44000.00	52000.00	10	1	\N	\N	\N	f	f	2026-02-27 11:44:50.11	2026-02-27 11:44:50.11
921756f2-3498-42dd-b349-32f618c77a36	Dell Desiktop Computer cor i5 6th RAM4 HDD 500TB	\N	Machinery	pcs	1	44000.00	52000.00	10	1	\N	\N	\N	f	f	2026-02-27 11:46:17.604	2026-02-27 11:46:17.604
df128990-f5f2-4cec-84d9-c9ba4aa88248	Hp laser jet 4003DN 	\N	Machinery	pcs	1	52000.00	60000.00	10	1	\N	\N	\N	f	f	2026-02-27 11:48:51.505	2026-02-27 11:48:51.505
8c7881e1-c0b3-42d3-8507-3e2d177befd7	UPS Turbo 1500VA	\N	Machinery	pcs	1	25000.00	30000.00	10	1	\N	\N	\N	f	f	2026-02-27 11:50:25.495	2026-02-27 11:50:25.495
50186f98-33fe-4ae1-888b-a005d335d9bf	Type C to 8 in 1 Convertor 	\N	Other Electronics & Accessories	pcs	1	1725.00	2800.00	10	3	\N	\N	\N	f	f	2026-02-27 11:52:55.963	2026-02-27 11:52:55.963
32b3a657-8783-4f18-a9b6-47ecc865847f	Midia Convertor maliti mode	\N	Networking Accessories	pcs	1	7475.00	8500.00	10	2	\N	\N	\N	f	f	2026-02-27 11:55:51.493	2026-02-27 11:55:51.493
9d46d3f3-3bca-4d9e-8e4a-fa209e5717ed	External Hardisk 2TB	\N	Computer Accessories	pcs	1	17000.00	22000.00	10	2	\N	\N	\N	f	f	2026-02-27 11:58:18.123	2026-02-27 11:58:18.123
c6816746-5d55-4462-954b-7b8a7194f1be	External Hardisk SSD 1TB	\N	Computer Accessories	pcs	1	32200.00	40200.00	10	1	\N	\N	\N	f	f	2026-02-27 11:59:33.822	2026-02-27 11:59:33.822
95e7aa86-f56a-40c6-b205-ac741ef693b1	Laptop Adapter C type Lenovo	\N	Computer Accessories	pcs	1	1840.00	2650.00	10	1	\N	\N	\N	f	f	2026-02-27 12:01:49.431	2026-02-27 12:01:49.431
93c188d1-9785-4ce3-aee2-ced7d91d9a19	Fisher 6mm	\N	Networking Accessories	pcs	1	172.00	405.00	10	1	\N	\N	\N	f	f	2026-02-27 12:03:17.367	2026-02-27 12:03:17.367
199f4de2-028a-429c-810e-2cb3608a8004	Serve Internal Hardisk 1TB	\N	Computer Accessories	pcs	1	21850.00	29850.00	10	1	\N	\N	\N	f	f	2026-02-27 12:04:42.519	2026-02-27 12:04:42.519
d0dfdfa4-708e-4ba0-b81b-fd1291a2d8f6	Midea converter Multi mode	Midea-converter-Multi-mode	Networking Accessories	pcs	1	6000.00	6900.00	10	3		\N	\N	t	f	2026-02-02 10:32:46.148	2026-02-27 12:19:09.439
c1393fc3-3668-4ddc-8970-25f909a79e99	Midia Convertor Single mode	\N	Networking Accessories	pcs	1	6900.00	8000.00	10	3	\N	\N	\N	f	f	2026-02-27 11:57:06.188	2026-02-27 12:20:41.705
371f5fc4-d402-4d93-a852-9238e2435645	Hp Desktop Computer Cori5 12th Generation Ram 8Gb SSd 512 	\N	Machinery	pcs	1	120000.00	130000.00	10	0	\N	\N	\N	f	f	2026-02-24 13:31:37.275	2026-02-27 13:00:42.653
\.


--
-- Data for Name: public_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.public_products (id, name, description, image_url, price, category, is_active, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, product_id, quantity, sale_unit, admin_price, overridden_price, final_price, subtotal, surplus_amount, admin_cut_amount, admin_cut_percentage, remaining_surplus, salesperson_gets_commission, salesperson_commission_amount, salesperson_commission_percentage, created_at) FROM stdin;
8dcc58a2-187f-4ea5-b4ba-8eaac308108b	d6764c68-7eab-4a1d-8fa1-57e665730986	d2e1d795-ad2b-45f2-8990-e6d965173d28	1	pieces	162000.00	162000.00	162000.00	162000.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-23 13:52:40.6
3f9502c0-82b5-4dcf-ab23-dec67ddbb787	d6764c68-7eab-4a1d-8fa1-57e665730986	d2e1d795-ad2b-45f2-8990-e6d965173d28	1	pieces	162000.00	162000.00	162000.00	162000.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-23 13:52:40.6
1c73bf0e-7fe1-41c3-a018-5132045aa037	73e7cecf-7986-44b7-a861-dc1a680e60ae	bdbf3d27-b503-42ba-bffc-a7a0a93b4b3d	1	pieces	500.00	500.00	500.00	500.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-23 14:03:08
8080ae5f-c140-49d4-ab8b-5f4a5f34bd11	df5615f3-4919-40a5-be83-0b6f0ff2ef2c	cb852bac-1c7d-412f-b1c5-502aace63043	1	pieces	2645.00	2645.00	2645.00	2645.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-24 10:42:25.519
672b0597-a4c5-4742-acb8-92286aaf7233	1cb4f8b1-8262-4dd8-b8bd-aada85fbea1a	f0d194a5-dfaa-426e-a85a-42e1c9a73f02	1	pieces	1150.00	1150.00	1150.00	1150.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-24 10:43:25.452
5c5d3055-d47a-4223-92d4-1874958358ab	617e1589-dae7-4c78-b4ca-37c386565c09	bdbf3d27-b503-42ba-bffc-a7a0a93b4b3d	1	pieces	500.00	500.00	500.00	500.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-25 11:10:23.608
e72effa2-1597-4326-bc12-81c983f11f97	609eaef8-a480-4aac-84da-8f36dfbcd859	bdbf3d27-b503-42ba-bffc-a7a0a93b4b3d	1	pieces	500.00	500.00	500.00	500.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-25 11:11:11.731
d998c2d3-e04f-4faa-a110-85371444524a	be6e5fa7-5150-4921-9639-12e6ef77b87e	4a7ded25-8979-44f4-b175-2123438ccbea	1	pieces	20000.00	20000.00	20000.00	20000.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-25 17:07:32.448
df80c79d-1f0b-49d3-b333-f234465b98d5	aa2159f1-87a4-49f9-b51b-bd33baa227a1	b3a49447-a019-49c9-8692-c76239c9ced1	1	pieces	1208.00	1208.00	1208.00	1208.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-27 08:14:38.705
79ce7e2a-09a9-42b0-bd1e-f08e5f2b1a14	36ab30da-c866-4bfa-bf29-c3eece3a9f0c	b3a49447-a019-49c9-8692-c76239c9ced1	1	pieces	1208.00	1208.00	1208.00	1208.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-27 08:16:50.961
13efd769-96fd-4455-9931-fe3ddc43a92a	625fa759-f15e-4bfb-989a-975ababd70a4	0db1735a-c6e2-4bb8-8c41-ce08edac9855	1	pieces	138.00	138.00	138.00	138.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-27 09:10:54.717
97e7a25e-a8bf-454c-97d1-3af2c691ebad	1d1fb3b3-ccf9-4426-b053-77d2db2c4db1	e005f819-e598-4435-83c6-5ea8b084b0b5	6	pieces	13000.00	15200.00	15200.00	91200.00	13200.00	0.00	\N	13200.00	f	0.00	\N	2026-02-27 12:34:09.403
cdeb9670-3613-4052-a76e-4802cac4379d	f6ece60f-f270-45c8-8444-9b245c468077	37d64b37-9426-4f69-b049-ff8ea08309ba	5	pieces	21000.00	24500.00	24500.00	122500.00	17500.00	0.00	\N	17500.00	f	0.00	\N	2026-02-27 12:43:04.073
b96c6188-0c36-4c30-8c10-bf2c0df060ce	55a36b79-0597-4469-96f4-90909db9af88	37d64b37-9426-4f69-b049-ff8ea08309ba	1	pieces	21000.00	21000.00	21000.00	21000.00	0.00	0.00	\N	0.00	f	0.00	\N	2026-02-27 12:54:25.805
ba09ce4b-1b7c-4277-9f9f-ad79f9000250	202ea8e3-11df-4c76-911f-ae17de18e449	371f5fc4-d402-4d93-a852-9238e2435645	1	pieces	130000.00	165500.00	165500.00	165500.00	35500.00	15110.80	\N	20389.20	f	0.00	\N	2026-02-27 13:00:42.644
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, invoice_number, company_id, walkin_name, walkin_phone, subtotal, vat_amount, tot_amount, total_amount, total_paid, total_credit, commission_amount, bank_type, salesperson_id, created_at, updated_at, bank_transfer_image_url) FROM stdin;
d6764c68-7eab-4a1d-8fa1-57e665730986	INV-20260223-0001	\N	\N	\N	324000.00	0.00	0.00	324000.00	324000.00	0.00	0.00	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-23 13:52:40.6	2026-02-23 13:52:40.6	\N
73e7cecf-7986-44b7-a861-dc1a680e60ae	INV-20260223-0002	\N	\N	\N	500.00	0.00	0.00	500.00	500.00	0.00	0.00	OTHER:sidama banj	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-23 14:03:08	2026-02-23 14:03:08	\N
df5615f3-4919-40a5-be83-0b6f0ff2ef2c	INV-20260224-0001	\N	\N	\N	2645.00	0.00	0.00	2645.00	2645.00	0.00	0.00	OTHER:Test bank	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-24 10:42:25.519	2026-02-24 10:42:25.519	\N
1cb4f8b1-8262-4dd8-b8bd-aada85fbea1a	INV-20260224-0002	6ac242d7-7b05-46e9-95a0-9640cfa2b078	\N	\N	1150.00	0.00	0.00	1150.00	0.00	1150.00	0.00	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-24 10:43:25.452	2026-02-24 10:43:25.452	\N
617e1589-dae7-4c78-b4ca-37c386565c09	INV-20260225-0001	\N	\N	\N	500.00	0.00	0.00	500.00	500.00	0.00	0.00	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-25 11:10:23.608	2026-02-25 11:10:23.608	\N
609eaef8-a480-4aac-84da-8f36dfbcd859	INV-20260225-0002	\N	Mous	\N	500.00	0.00	0.00	500.00	500.00	0.00	0.00	AWASH	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-25 11:11:11.731	2026-02-25 11:11:11.731	\N
be6e5fa7-5150-4921-9639-12e6ef77b87e	INV-20260225-0003	\N	\N	\N	20000.00	0.00	0.00	20000.00	20000.00	0.00	0.00	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-25 17:07:32.448	2026-02-25 17:07:32.448	\N
aa2159f1-87a4-49f9-b51b-bd33baa227a1	INV-20260227-0001	\N	\N	\N	1208.00	0.00	0.00	1208.00	1208.00	0.00	0.00	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 08:14:38.705	2026-02-27 08:14:38.705	\N
36ab30da-c866-4bfa-bf29-c3eece3a9f0c	INV-20260227-0002	\N	\N	\N	1208.00	0.00	0.00	1208.00	1208.00	0.00	0.00	AWASH	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 08:16:50.961	2026-02-27 08:16:50.961	\N
625fa759-f15e-4bfb-989a-975ababd70a4	INV-20260227-0003	\N	test	\N	138.00	0.00	0.00	138.00	138.00	0.00	0.00	TELEBIRR	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 09:10:54.717	2026-02-27 09:10:54.717	\N
1d1fb3b3-ccf9-4426-b053-77d2db2c4db1	INV-20260227-0004	\N	Aje Town Municipality Office	\N	91200.00	0.00	0.00	91200.00	91200.00	0.00	0.00	OTHER:Sinqe Bank	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 12:34:09.403	2026-02-27 12:34:09.403	\N
f6ece60f-f270-45c8-8444-9b245c468077	INV-20260227-0005	\N	Aje Town Municipality Office	\N	122500.00	0.00	0.00	122500.00	122500.00	0.00	0.00	OTHER:Sinqe Bank	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 12:43:04.073	2026-02-27 12:43:04.073	\N
55a36b79-0597-4469-96f4-90909db9af88	INV-20260227-0006	\N	Aje Town Municipality Office	\N	21000.00	0.00	0.00	21000.00	21000.00	0.00	0.00	OTHER:Sinqe Banke	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 12:54:25.805	2026-02-27 12:54:25.805	\N
202ea8e3-11df-4c76-911f-ae17de18e449	INV-20260227-0007	\N	Dugda Dawa Finiance Office 	\N	165500.00	0.00	0.00	165500.00	165500.00	0.00	0.00	CBE	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 13:00:42.644	2026-02-27 13:00:42.644	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, description, updated_at, updated_by) FROM stdin;
e7b4be22-cc8a-4c99-89c3-4b091ebe2b47	login_access_code	REALBRIGHT2025	\N	2025-12-30 13:24:23.383	\N
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_adjustments (id, product_id, qty_change, reason, notes, created_by, created_at) FROM stdin;
e6304f7a-98b3-4613-8ff6-8bbd1fbdc354	50500971-fc92-4812-bb7c-8e71822b87b9	2	CORRECTION	\N	a870951e-bdcf-4bb8-969f-13951c99daeb	2026-02-02 12:42:26.935
4088bcb6-266a-4265-b474-87217a5484a1	ad3338f8-fa47-42eb-9483-84426ac1d09d	12	CORRECTION	\N	d8edcde5-4957-40b5-8e4c-ebb37f18c274	2026-02-23 14:30:43.688
e97f2b5b-aa09-484a-89c7-6cfd116066c6	ad3338f8-fa47-42eb-9483-84426ac1d09d	12	CORRECTION	\N	d8edcde5-4957-40b5-8e4c-ebb37f18c274	2026-02-23 14:30:43.688
d4b9c4b6-a716-4152-8b7c-9b197f620013	ad3338f8-fa47-42eb-9483-84426ac1d09d	12	CORRECTION	\N	d8edcde5-4957-40b5-8e4c-ebb37f18c274	2026-02-23 14:30:43.937
023ada31-f475-4292-a589-8f474d4f100e	50500971-fc92-4812-bb7c-8e71822b87b9	-1	COUNT_ERROR	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 12:10:43.618
48e4cc1a-c11d-408d-b901-0b34b9955d05	d0dfdfa4-708e-4ba0-b81b-fd1291a2d8f6	2	COUNT_ERROR	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 12:19:09.436
13d4647d-9c47-4d46-a245-ffdcae16106f	c1393fc3-3668-4ddc-8970-25f909a79e99	2	CORRECTION	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 12:20:41.703
307693e6-1339-485b-a907-e3df33e06646	50500971-fc92-4812-bb7c-8e71822b87b9	-1	CORRECTION	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 12:23:42.744
62afb0f2-01b2-4b9b-ae3c-9c9d1b394253	7e0e9561-84ea-47c8-a9e8-86b7656aa99e	-1	CORRECTION	\N	715a1fe2-b8a7-4436-a6ec-064344eb1b1f	2026-02-27 12:28:18.389
\.


--
-- Data for Name: stock_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_entries (id, product_id, quantity, cost_price, batch_number, expiry_date, supplier_name, status, owed_amount, notes, created_at, updated_at) FROM stdin;
eef9c4bf-4bc5-43ae-943e-937656835d3b	7be95056-f629-48c7-ba8f-b32fc1ebb924	1	135000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.453	2026-02-02 10:42:32.453
82f973e8-ecdf-4364-8f80-61c1c5b36f7e	dbcbbe5a-bec2-44cf-a13a-e10404c9877c	2	43000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.462	2026-02-02 10:42:32.462
ba94a984-c27c-4f00-96a8-d117a5ac59b5	478ef94a-3611-4452-a758-4ae6b8249e72	1	48000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.467	2026-02-02 10:42:32.467
3993b3bb-acd0-43cd-a0b8-7e831923a19d	e65ab140-7118-4630-a8fc-d671c2c221d2	1	45000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.469	2026-02-02 10:42:32.469
9652fd27-199f-4cb3-858e-9329c133cc37	dbbfdd4b-d0c0-420f-baee-26ad50187877	1	34000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.471	2026-02-02 10:42:32.471
48b0a9cc-dc4c-44e9-a379-de004fd21944	052184a3-61ca-43db-8fa7-c5d5b2e8a123	1	34000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.473	2026-02-02 10:42:32.473
abf7f549-463e-45d5-81c2-e80fa1c11592	56609f75-847c-41ae-b07c-e011b6272e4a	2	26500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.475	2026-02-02 10:42:32.475
5601e204-a24c-4108-9ce2-9e942fd382f2	e6da5876-a86f-4b42-a501-5dddeddde250	4	46000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.476	2026-02-02 10:42:32.476
e52a83de-2968-4b95-94ab-678424dc1bed	9a0c2d86-741f-40df-a2fb-0ba56d30a2c0	2	36500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.478	2026-02-02 10:42:32.478
34332e8c-5742-46d4-9a3a-764ef7ad3e4c	3b454b32-6d4d-4afc-a08e-26d8d833dd59	1	16500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.48	2026-02-02 10:42:32.48
067e45f8-cb2a-48ad-9a2a-e9f9dc365336	1ec3c656-8322-4e19-9d7c-637a17a4cf35	4	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.481	2026-02-02 10:42:32.481
a3b84bc0-fd14-4bc4-ad4e-9c9f2d323142	d4d59ce0-236d-4120-9c3c-16673a22162a	1	39000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.483	2026-02-02 10:42:32.483
5dd506ae-af1b-48a5-a530-9fa7d576115f	e93d3b8c-c126-4c72-bfc9-564b1001b266	2	7500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.485	2026-02-02 10:42:32.485
a92f4d8c-92a4-4df2-9c49-fa07027bad16	101aca97-3da1-4702-b517-a27e9c1103fc	1	39000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.487	2026-02-02 10:42:32.487
f703c17f-214b-4368-92c3-4687af1994f3	c02f3793-8815-4cb3-96ff-6b066fc40dce	1	9000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.488	2026-02-02 10:42:32.488
16cb6ded-02e9-49bf-ae85-b148dd9271c0	e2256fbe-7153-44c8-9c7a-2bb09dc92cbd	1	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.49	2026-02-02 10:42:32.49
0c09ec55-8fc2-47fe-b286-2bdf6f250ecb	2e453bd5-8e0e-4db4-8b0a-e356e809247b	1	10900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.491	2026-02-02 10:42:32.491
1920fdeb-d67d-44c7-a193-3a4fc74edba9	264d70ca-1b6c-492b-a9f7-f3ab0373badb	1	8500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.493	2026-02-02 10:42:32.493
83a8d830-f5a3-4308-b221-5805c8a93ba5	6dd7a731-ef6a-42cd-b942-0ba432d11900	1	11500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.494	2026-02-02 10:42:32.494
3b9f4252-e3e8-4987-abbe-19b0b645568f	d6c50df9-7b20-4a62-92b5-6855507cfc4b	1	63000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.496	2026-02-02 10:42:32.496
69e3086d-0f1b-4197-bde2-eb7ccbb38162	5a0656f8-74fa-4061-a332-0ec493e3cf25	3	24000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.498	2026-02-02 10:42:32.498
2c79207b-5105-48ab-a5d1-787952dd5694	f2ef5a1a-1c1b-45d1-98bd-68096ae135be	2	13000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.5	2026-02-02 10:42:32.5
95edf2f2-a600-4b4c-abd1-9fd9fe41b899	b387593a-55fc-4324-a2b1-8c5485493fbf	1	26500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.501	2026-02-02 10:42:32.501
0b5b5e03-eab4-413d-bb74-6779e24b3bab	4ebe1ff5-9162-44d5-be74-56febe940c8e	1	24500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.503	2026-02-02 10:42:32.503
8e506f6d-7344-4d04-bb65-3f67d9bfc2bf	4bd750dc-6c89-43ed-87ba-58e0f35f2abe	1	25500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.504	2026-02-02 10:42:32.504
d002a83e-eb5d-432a-a9d9-bc9c5a97ac14	87970c5d-26ce-4ed3-975a-fd2b80a558b2	1	16500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.505	2026-02-02 10:42:32.505
4c33bbdb-054e-4e1c-903c-9ce6b9f5da8d	dd7112a8-6f35-4aea-bca9-6998deaef76e	1	2200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.507	2026-02-02 10:42:32.507
3f529ad2-ef28-41e1-ad6d-c6be9e7bf6aa	c6e1619e-f3b8-46c1-96a9-524a5da00175	1	103000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.508	2026-02-02 10:42:32.508
9e69d2bd-ecbb-4428-8aef-1c0aa8e2dba3	41e05bb4-9f41-401f-a8db-bd43e9a4b5d6	1	60000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.509	2026-02-02 10:42:32.509
27e94706-561c-4d3e-abb1-f7c29611dd99	db9a6f5f-6a3f-4d6a-9584-e4aedb948760	1	30500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.511	2026-02-02 10:42:32.511
c31dfe18-1faf-43b8-b6a5-47b415d2b357	ed9bf4d1-eb7e-4b7f-ba26-79a6a90da07d	1	95000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.512	2026-02-02 10:42:32.512
b095c2d0-bfcc-4c19-8f55-ddf59869a5ba	7485bd80-7386-4f25-825e-f99fdaa12ec8	54	150.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.513	2026-02-02 10:42:32.513
d28034d2-fddd-4ae7-9c7d-150746549415	56c7b70b-9ab1-4bdc-a993-f698f3606e4e	73	130.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.515	2026-02-02 10:42:32.515
0c39dbc8-24c5-46bc-85b9-74e7c8ec5474	06f1b41f-ef9a-46e7-9261-5c07188db9b2	31	180.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.516	2026-02-02 10:42:32.516
701c0b9d-fa31-41eb-a955-298cdd6fd27d	3e0f4a24-34bc-4904-af9f-78c7f4bb9c7b	7	60.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.517	2026-02-02 10:42:32.517
bfcdb3dd-a051-4f4e-918f-a04768900a7b	4b653b5b-894e-4e51-9834-010bfa0c7a95	2	200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.519	2026-02-02 10:42:32.519
edc51ba5-f74a-47b6-8075-f2bf1e14f715	37ca753c-6d1a-452e-9877-e8ac5b2064b5	1	13000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.52	2026-02-02 10:42:32.52
2f940174-7de5-4b37-8930-bc0ee9f858af	8897ff16-7bef-4ce0-bae5-ad8f4c207576	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.521	2026-02-02 10:42:32.521
9d869ed4-6f4c-45d3-a7c0-9c2a789858f1	2468af3c-880a-4a89-b370-f1bfc247e5fb	2	4000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.522	2026-02-02 10:42:32.522
10a087be-114f-4493-a1a7-301cc17b4915	cb852bac-1c7d-412f-b1c5-502aace63043	2	2300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.524	2026-02-02 10:42:32.524
7c1b02a9-aebc-4597-9aab-595c789a0751	a58b4a07-4a86-4e7a-afe3-e964060aeb2f	1	3500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.525	2026-02-02 10:42:32.525
46a657bb-76af-4b17-bd72-7de3b4ef3edd	d3d1b5a6-a5e2-45f4-a661-82f515311aaf	1	3000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.526	2026-02-02 10:42:32.526
0e42f093-5272-4462-8d50-1ff2acec66a5	4b032f94-8cf0-4961-a615-8bd4a5576caf	1	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.528	2026-02-02 10:42:32.528
a070fed4-3041-4c27-969e-4260249c81cf	2116a26c-11f2-4002-b144-e8b92a164a12	1	900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.529	2026-02-02 10:42:32.529
6fe38148-65dd-4b25-a5dd-102b9f987d6f	ef3c4053-e14e-4ab0-9388-de28b4ccc1e6	2	1800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.53	2026-02-02 10:42:32.53
b565166a-44b7-4120-beed-5970d7860eb3	6ec23840-09f6-4799-b60f-0a3217fb6644	3	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.532	2026-02-02 10:42:32.532
fcd926e9-b22d-458a-893e-0f21125ecf5c	60397b10-f717-45a4-8075-61e3d1927454	4	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.533	2026-02-02 10:42:32.533
31b0beb7-24f9-4e77-8aaf-2b144e246370	e665e1bf-3092-4810-b920-67035c7bdeef	2	1200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.534	2026-02-02 10:42:32.534
6eec3147-ffe9-43ff-8a83-edab8c128bc6	c2268fc8-f9b3-4eae-aab3-10ff70852562	1	500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.535	2026-02-02 10:42:32.535
c2e5572b-7b9f-4e67-855e-d273c8d5dbc5	9b346d68-a8b1-400f-9cf3-c298ae5b8736	1	550.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.537	2026-02-02 10:42:32.537
3e6bd429-526a-4f49-bc7b-a94c6b4c9f42	2a094433-fac8-4d7d-8209-71155d105e21	2	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.538	2026-02-02 10:42:32.538
3848e70f-8f4b-4664-aeb5-a23f21d6e19d	f85346b9-b46f-46b7-94da-1c3e2e9dc573	6	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.54	2026-02-02 10:42:32.54
3a11808a-05c1-4d23-a7d2-e0dcd369afeb	e90b925d-1912-4113-85cb-a27a285c4dba	4	1600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.541	2026-02-02 10:42:32.541
f07cf151-ad1e-45b0-ba0e-9bc0c3232c25	769d8554-1f34-4945-86d6-13dc8390195d	10	1600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.542	2026-02-02 10:42:32.542
189abb2a-ce85-40e1-a899-7009ffff6492	a5a5c9ab-646b-4143-9b01-83e9c635e43c	4	3000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.544	2026-02-02 10:42:32.544
afc3dfff-8446-4b2b-bc25-c6b914c2ab8f	7c926635-d262-4abf-9cfa-f7ef88ab106d	3	2650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.545	2026-02-02 10:42:32.545
ac157a93-6924-4b50-9c94-614105a5ebcd	39197aa0-f95e-41bd-9e5f-27bfd67290f5	1	2650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.547	2026-02-02 10:42:32.547
a4988546-4470-42eb-a0f6-ddd627e11ce4	b4510fa1-88ba-433e-9b17-1f07facdbddf	1	2300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.548	2026-02-02 10:42:32.548
b371264e-2470-436d-af70-fa8be391656b	9c2ea417-f251-45d7-8898-7ea585fc6c0a	1	800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.549	2026-02-02 10:42:32.549
a462a0c7-d7f9-46a8-8488-a9f586a8e155	f11b373f-ee3e-45b0-a287-102efd9b4247	2	5000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.551	2026-02-02 10:42:32.551
5bcca122-0829-47f4-8850-d669b2fc11a3	50500971-fc92-4812-bb7c-8e71822b87b9	1	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.552	2026-02-02 10:42:32.552
39b45a90-c82e-4c76-8296-2321c4ebdaca	6540d728-6e67-46e7-9ea9-ce87c32a6594	2	6900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.553	2026-02-02 10:42:32.553
61f24099-fc9e-4444-8cd8-288e8d6bb798	fc784d45-9a96-4cb9-b1a0-a84f9961e6dd	2	1050.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.555	2026-02-02 10:42:32.555
6a474072-cb22-42be-9518-d53ec17a5337	0fa4870b-39d7-4012-8468-1635241c20d7	10	1050.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.557	2026-02-02 10:42:32.557
ba3b3606-fb07-4b7c-87ca-cadf4c63eee7	1c01234c-c78f-49f5-b71d-00757dd2ad64	5	1050.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.558	2026-02-02 10:42:32.558
3c4f54f4-22ce-4e4e-ba93-54dffd2c94ef	80fd0db3-0f3d-485d-b475-24853ae1c1f2	7	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.56	2026-02-02 10:42:32.56
035e23c8-a454-4679-9c4d-6a56d6e0db7a	bc3bdf82-e498-496b-8f93-509600f777d6	1	1840.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.561	2026-02-02 10:42:32.561
a6b3f0b7-0d8f-433b-bff3-4b79ab55f665	3dee2ecd-c0d3-4faa-9bba-4aeaf101265d	7	1000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.562	2026-02-02 10:42:32.562
52da7cf1-a8a5-420a-bbc8-271aadec56be	fa5623a8-4833-43a1-83e7-11d43458addc	2	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.564	2026-02-02 10:42:32.564
f74a9a09-b5b0-4cb9-9c8d-f23459d53052	50a3f0d0-b182-4c54-8a61-366968bbbbb4	2	635.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.565	2026-02-02 10:42:32.565
8d754b7a-3f0d-4cd2-ad79-a029aa9a08c8	35a5650c-3a29-43c8-a9ed-0535ac97432f	2	2300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.567	2026-02-02 10:42:32.567
038ae816-7c68-4765-9706-da4015261981	f6645c38-0eab-44a4-9f7e-94163add7fdf	1	750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.568	2026-02-02 10:42:32.568
8e174d3f-6014-46bb-826c-78e116f8f5c6	9809ac40-aab4-4082-a6d9-627eb48a82cd	1	750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.57	2026-02-02 10:42:32.57
58c8a9a0-c040-4702-b9de-29d5e0683592	4368e387-8e69-49a9-a213-acb184077df9	3	1265.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.571	2026-02-02 10:42:32.571
1dd5cc6a-8536-4e69-b18a-14e226629f1c	cf805b1b-8c62-42a8-9f76-823fdebc1e87	1	2650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.573	2026-02-02 10:42:32.573
e0af4ce1-de52-4cb8-803b-240a947e3f8e	188f8869-b6f1-45a0-9a4a-609009857fc2	1	2600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.574	2026-02-02 10:42:32.574
81821aa7-bc87-44f6-b5fc-a69e328e1452	33c0caca-2994-4f16-a47d-2a394e68be1f	6	920.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.576	2026-02-02 10:42:32.576
8fef4598-de0a-453d-b7fd-18d874f5b3d2	7d63c4c8-84c8-4374-8bfa-cc372819703f	1	870.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.577	2026-02-02 10:42:32.577
574ab3e7-87cb-4099-8fba-e163d156ab59	ec19e637-d42e-4ae7-be1b-697c33c4df3e	2	870.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.578	2026-02-02 10:42:32.578
a1c41779-112c-49c6-8459-9e34e9095443	59942ccb-165f-45b7-9687-245c8385982c	5	800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.58	2026-02-02 10:42:32.58
5e321bd3-32cb-4476-9a2a-a3c97c880a4e	a8ddc429-7c98-41bc-8e92-bdbb919afd3f	1	870.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.581	2026-02-02 10:42:32.581
22805538-691d-4c15-9888-2bcad1e11e37	f0585807-fd4c-44f0-8904-aae94f82000c	14	630.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.583	2026-02-02 10:42:32.583
5c5b7bfb-65eb-4221-a3ea-974e14ca5d7b	f607370c-998d-4426-ab8e-0ffcb8f0b210	3	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.584	2026-02-02 10:42:32.584
b8019a63-d6a7-43d8-a912-08317ee016f3	e72bfa00-70e4-4749-af10-2acfc7bf5d8a	2	860.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.586	2026-02-02 10:42:32.586
c8ee19be-a199-4c0d-8d68-d71875ad94b2	dc9c137e-acf9-469d-9879-1850ed407ad3	1	870.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.587	2026-02-02 10:42:32.587
0c0469d4-ab76-4656-8fbc-d67c888c319c	ad03515c-6c46-473f-b156-96efbe31ff97	3	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.589	2026-02-02 10:42:32.589
14987200-a7a4-4fce-baec-604b474d5e30	9aa1fce9-6cf5-47f9-a9e4-7a2c39b09e5a	2	1350.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.59	2026-02-02 10:42:32.59
16a39bea-a359-45ee-9654-3d743cebdbbc	055bd0ac-9826-4c89-8c13-2f54e63802f4	1	1000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.591	2026-02-02 10:42:32.591
b079c5cf-c065-44c3-b90c-9f31d74f14c6	e4786f8c-e1a7-4ca7-bbcd-a20871a4a636	4	2650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.593	2026-02-02 10:42:32.593
22885392-8313-4b30-8e54-0a4d0693ca1e	af78379f-6430-4f9f-881d-f49091c53f2f	2	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.594	2026-02-02 10:42:32.594
669e6940-6c36-49d4-961b-cfa0e0c28ca5	7e9234a9-15e5-4728-9b61-1fccef1191ab	3	630.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.595	2026-02-02 10:42:32.595
97f9b4f9-586d-4219-a4e6-947fac9c2c32	68bd76dd-7845-4e5d-a073-dee980a4a4c2	1	2000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.596	2026-02-02 10:42:32.596
f54daf22-ee0f-4b2a-8386-2cd10b05f345	873bde2b-c296-4fbb-98b5-f1a1af4a0cef	1	180.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.598	2026-02-02 10:42:32.598
8dfdc888-9404-4d04-a047-6cd52ad78e3c	6f1ce60d-2308-4838-a3c2-8514ac5f2087	15	200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.599	2026-02-02 10:42:32.599
f0c544c3-01c2-497c-aab1-2c0c65c0a2da	491a4463-ef4c-4cb6-a7a5-25205819d419	7	670.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.6	2026-02-02 10:42:32.6
4c35f428-9a78-4e59-a849-947b6c6aba01	69cb1624-9c51-423e-999d-83ff5740432c	34	368.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.602	2026-02-02 10:42:32.602
73bd2985-376b-400e-a9b7-c4de8a383124	5ac958e7-6838-43c3-bb0b-b1da609cd9b7	12	400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.604	2026-02-02 10:42:32.604
dee74ae8-6527-403c-aa36-a3762edb7aac	d87eefa0-7b7c-4e3d-8837-0cd89f05c33c	2	400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.605	2026-02-02 10:42:32.605
2735b628-f0d8-486f-acbb-540f0a08c673	5d401da4-a437-43d4-84a7-be39f4de7d80	1	630.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.606	2026-02-02 10:42:32.606
10048838-b0e0-481c-aae3-bc378e8f2e56	4d5ad9c8-e4d5-4714-9ebb-8d60c2fb6934	5	630.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.608	2026-02-02 10:42:32.608
207e05a6-e497-481a-b065-ebd88a04a895	9ceb3269-26a3-4e05-ad1e-2215c5bdd825	1	400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.609	2026-02-02 10:42:32.609
26464be0-8983-48e0-a252-f9f5604deab1	6ec000a2-4710-4b0b-9a7c-5b749e80685b	1	630.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.611	2026-02-02 10:42:32.611
40de3ef0-6982-46cd-a45c-bd08f4268f49	6da99804-0f27-4b1e-8eca-07e9303ecdf2	4	400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.612	2026-02-02 10:42:32.612
6bf39d78-184d-43a8-a9ba-a8afea1f8d82	d79085cf-f53d-41ff-9132-0313ec65f709	3	820.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.613	2026-02-02 10:42:32.613
56f82538-0533-48d7-83e9-194ace75d86f	5f0bf564-a9ff-4b57-aa68-6926ec8255e3	2	520.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.614	2026-02-02 10:42:32.614
46a36874-2c2b-4000-8094-52bedad79f46	bdbf3d27-b503-42ba-bffc-a7a0a93b4b3d	3	400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.616	2026-02-02 10:42:32.616
e50bf406-b7b5-4e97-95b1-1af2e3ec4dc7	cdd2f188-19d6-48d3-9e44-cf20370163dc	1	1050.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.617	2026-02-02 10:42:32.617
42a89687-c03c-4bb1-bdc0-25bd1eb3eba0	a853f8d7-fa7e-48c3-ab99-76fd0950861f	5	250.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.619	2026-02-02 10:42:32.619
b67150ee-8a1e-4d7b-a4a7-c6b2f3a9652e	c02c607d-06d4-493e-a55e-a1d070a476e5	3	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.62	2026-02-02 10:42:32.62
5e1e806e-63f6-4313-88f7-723b1bc1111e	f6513e38-5fad-4466-8896-f9429d6dc2e4	2	2300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.622	2026-02-02 10:42:32.622
0be469db-4aed-4d16-813d-24c1ea394124	0816bdb0-54e4-4b91-975c-6f2735a40a6a	2	800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.623	2026-02-02 10:42:32.623
0976a248-2fa7-4bfb-a365-4db509761a36	f15810ac-89c8-4525-8539-8aee23788f18	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.624	2026-02-02 10:42:32.624
1d423531-9bc2-4107-b3ec-f03d435ae363	514ff8ad-44fe-46e5-bf98-75d526c1b2c4	24	80.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.625	2026-02-02 10:42:32.625
1a0b3204-8098-4b52-b62e-d113bd28a2fb	50a4f2e3-5fc4-4bef-baea-962f970e4212	4	460.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.627	2026-02-02 10:42:32.627
1aef83e6-9744-4fc2-bdd5-2f8872814c40	bacf488b-3660-4f23-88ca-dc1783b7a31e	3	900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.628	2026-02-02 10:42:32.628
8bd0ff59-f767-408d-b26f-d3c96b40792b	31c3d896-1b54-4288-a3cc-212c328beb1f	2	2300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.629	2026-02-02 10:42:32.629
0124aef8-aa79-4d27-bc15-fb317cff149f	fc3cdd06-5ee2-4df7-8388-26ebb003905a	1	3500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.631	2026-02-02 10:42:32.631
ff34eb52-5804-460e-80e1-a1ed0111bfbf	44b3ea36-ae0b-4304-9892-1d070e30c5da	1	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.632	2026-02-02 10:42:32.632
708f7b28-425a-4895-8678-932071855d9a	adb1bc23-2301-4c8c-a34f-2c5f7baf9c03	2	3200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.633	2026-02-02 10:42:32.633
e3e5116a-a6c1-4cb4-8e2a-e9396177f0eb	c5c83558-7d60-45cd-b4b2-345276a75e88	3	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.635	2026-02-02 10:42:32.635
160d68a8-8bab-43c5-9963-e232b8a3b1ad	19055124-fd83-40b2-88e8-4364c6091555	1	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.636	2026-02-02 10:42:32.636
9fcf937d-ad49-4470-b484-505cff039bcb	1d9aba04-b0ab-40cd-92ac-576a966aa9c3	10	700.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.638	2026-02-02 10:42:32.638
8f2def94-c37d-4f0f-9488-34a7ff7fdb01	f0d194a5-dfaa-426e-a85a-42e1c9a73f02	11	1000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.639	2026-02-02 10:42:32.639
102172a1-5096-4435-826c-b4aed3b38d2c	e0f23392-9a49-4798-b1ae-0b6f01a6ea7e	5	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.64	2026-02-02 10:42:32.64
44c3ae2d-61da-4f60-9b4f-0c622536e7ac	7d4e58f6-9357-41f0-8299-494f287bfd6d	2	860.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.642	2026-02-02 10:42:32.642
fc70d5d0-8630-4f31-b069-a685f476f0cf	b9fb652a-fe8e-45fa-812d-ba8ed0cf02a3	9	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.643	2026-02-02 10:42:32.643
346254a8-4657-48d3-822c-81651185733a	63c730d4-c3e2-44b7-b015-815dc1a20370	1	2000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.644	2026-02-02 10:42:32.644
d428da22-bd63-4f2d-9da9-ef1269d06f5c	22b154c4-af2f-44ae-8f12-b41d69eb898a	1	3200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.646	2026-02-02 10:42:32.646
b159bbd0-d0cb-4f2d-8862-6784cec5ccfb	f4ad5a25-3463-421e-a997-4a84b3a0a75d	1	3000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.647	2026-02-02 10:42:32.647
e94075a3-1704-4602-ace5-efe86b2989af	182596e4-adca-4803-9857-cdebdd4fba38	2	860.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.648	2026-02-02 10:42:32.648
2191fcaf-34ee-4b67-94ea-7a902286759c	dc2d4c1f-b2d5-41f8-a919-397d918a283d	14	400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.65	2026-02-02 10:42:32.65
584b69ca-aba5-454e-bbee-d1354e9b86c4	3149132d-37e7-445b-8b49-60a1b0c5f786	1	400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.651	2026-02-02 10:42:32.651
8498143d-83c3-4269-bcc9-65574921ff22	b3a49447-a019-49c9-8692-c76239c9ced1	4	1050.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.652	2026-02-02 10:42:32.652
0145b143-08e3-4eef-85de-3eb2eed7ddce	6a3752b7-b272-42df-8a36-bebdce85fd74	3	690.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.654	2026-02-02 10:42:32.654
cb7697a1-5ad3-42ca-b405-144d843128ed	dd3c8b43-1e27-4cde-9fa9-4faeb15da969	300	65.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.655	2026-02-02 10:42:32.655
3e0dcbe2-4c07-4d31-a32d-af8846a979cc	27d40841-e176-46a2-a50f-2b2e40221fea	1	90.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.656	2026-02-02 10:42:32.656
6890cabd-b514-4bf6-bbee-85c40cfd33f9	aa751d7c-39cf-4ff5-8931-3f851eabb9a2	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.657	2026-02-02 10:42:32.657
2e3659c9-7f5f-4464-86ef-7bb1e7445493	d9bd8957-9bcf-4976-a56b-def46c54511d	2	2300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.659	2026-02-02 10:42:32.659
69734435-2c23-482f-b5d1-3d4e7c21975a	be767ffe-ab58-4c8d-9589-725a4a0be206	3	1800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.66	2026-02-02 10:42:32.66
63410230-d86b-404a-864d-97c46e52257f	af851aad-260d-415b-a46c-ac49b3ab244f	1	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.661	2026-02-02 10:42:32.661
aadac3a5-d213-4073-be0e-45ae2713ad04	db76c4b8-6c7f-4ea8-a4c3-bb7bad0a4d1d	14	800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.663	2026-02-02 10:42:32.663
b24bea98-4f9c-42fe-b571-14c48c2e2c97	21b4b24f-985f-439e-87b0-d84210e62b9c	12	800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.664	2026-02-02 10:42:32.664
94944b5c-e601-4bb5-a035-bd3634402829	27ed691a-6ee8-4203-90a8-88571f7ba868	2	35.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.665	2026-02-02 10:42:32.665
d36b2a2f-b380-4c67-9a1d-700b247073b9	e3068924-1a6a-45d2-8183-8eb223cfc9d9	1	550.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.667	2026-02-02 10:42:32.667
9fe441e3-b880-41d8-8b36-2a5cc3da5e1c	287a9c68-a4b1-490a-ba27-39e6983e0070	9	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.668	2026-02-02 10:42:32.668
31be5eb5-0e94-41f1-bd58-35ce0d319d85	5cbdb8e4-5e0a-4c84-a34f-2242c23abd48	19	950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.669	2026-02-02 10:42:32.669
09565c06-e396-4b60-af34-659d6ead8745	dd2d79e3-a410-4783-8865-8d5360dea92b	13	1100.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.671	2026-02-02 10:42:32.671
88e84515-6037-44fc-8313-5dccf6eda9d0	0bdd51aa-758e-40c4-be76-94e8af9af5a0	33	350.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.672	2026-02-02 10:42:32.672
3bab7506-c66f-4a0a-abc5-85fe92ad56b2	1e8eead0-4249-43ec-a893-880af336d1f7	20	160.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.674	2026-02-02 10:42:32.674
d15c058e-3bf7-41e3-ae24-398ea0d02c93	1303ae2c-1b02-41d9-8114-4a4b5cb0b762	38	360.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.675	2026-02-02 10:42:32.675
12133357-310e-4d37-b359-5cc73c53cd8e	01b6cad7-a3da-4a50-9075-7121c0e678ab	9	557.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.676	2026-02-02 10:42:32.676
3dc76ea2-1cc3-44c0-af61-51396b691075	2d0a2221-bc9b-475d-a9ae-303352615a5f	12	557.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.677	2026-02-02 10:42:32.677
d509aaae-2b3c-4234-a9d2-2186ffe590f9	76ed8971-72ab-4a65-b084-36fe9e9dfc4a	4	700.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.679	2026-02-02 10:42:32.679
af471829-b22e-49db-a85d-d1df2f78cf21	2ce0b090-eb6b-47ab-94dc-5ffeb0a82cdc	6	900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.68	2026-02-02 10:42:32.68
d3210f70-4d9a-4a6a-83e4-a5b33874c8f3	911d4592-d068-4a9b-b2c0-c12acb32cef0	6	900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.681	2026-02-02 10:42:32.681
828db2bd-e541-46be-a2e0-172cba0f489a	55240573-cfbe-48f9-a464-cb491b530172	3	200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.683	2026-02-02 10:42:32.683
1081e38f-441c-461e-8efb-f207bfda4515	32e19e58-e1b0-4428-a353-8572c8aef664	11	550.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.684	2026-02-02 10:42:32.684
d8d06f37-b6a3-4238-9280-42e008c7673c	fb5b0f78-bfc7-4227-9f8d-3d9e6ffbc9b7	4	200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.686	2026-02-02 10:42:32.686
ed453783-a15f-4ade-925e-ce6a45ffc18b	a3bb96bd-b7a7-43e5-98ca-352a4c39624d	2	480.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.688	2026-02-02 10:42:32.688
100160c5-253f-43be-8851-63a63879a441	d3ed9608-3699-41ce-a1ec-88f67fad35da	1	1380.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.689	2026-02-02 10:42:32.689
e44aba13-c256-4547-9649-debc29aa37e1	c90dff64-8f0d-43ea-b2ce-b2d7dd8c0aa8	3	860.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.69	2026-02-02 10:42:32.69
d8784f65-bf3c-40da-8e3a-975139108fcd	75285077-4de7-41c3-b33b-154dad15ab13	4	1380.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.692	2026-02-02 10:42:32.692
e685f91d-ccc6-4530-bb6b-7302ff499adb	d3658612-2fe0-4308-9f7d-4543a0f709f0	7	2000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.693	2026-02-02 10:42:32.693
a0be0ba1-c211-4c51-b829-8f769544cfa4	4336ce89-82e4-48c0-adb1-7764209358a2	26	65.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.695	2026-02-02 10:42:32.695
02780a88-4dd3-4bca-ae9e-c172b7fc5fd1	b1b8c063-0c10-484f-a024-4ad28494f9f7	4	580.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.696	2026-02-02 10:42:32.696
c28788a1-9012-4237-8ee8-e4557c2bf231	fa714f81-0fc3-4ab3-8a74-8c6acdbbda1b	5	1300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.697	2026-02-02 10:42:32.697
a14df0c2-9db2-40cb-8d91-ac3c1c3115ec	fc6be6b8-51b8-4ee4-a14e-9bd465aaf36b	1	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.699	2026-02-02 10:42:32.699
48ab2e24-9cfb-4d1b-9ba4-9ee1a49bf085	179b0c02-a27f-4dfe-ac15-4174764427d0	2	1200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.7	2026-02-02 10:42:32.7
42d1e65e-0f5f-4238-8e02-2b74cedd156e	8e1ef539-f097-4c5f-a78d-422e71e6d76b	200	35.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.702	2026-02-02 10:42:32.702
a1af9b04-50d4-4f37-9874-d1e85bfda417	2c16c821-c822-4620-b36d-d212eb8c1530	1	80.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.703	2026-02-02 10:42:32.703
21be38d2-aa26-4e42-9da5-fa11065ec466	9ebe5139-912d-49fe-8daf-44a40e89ff2e	2	950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.705	2026-02-02 10:42:32.705
c6860301-a82d-4efe-aaeb-5bca0b9a55de	39ddd416-c964-4433-81cf-6f398ee59017	6	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.706	2026-02-02 10:42:32.706
324060ae-de2e-4d28-9eed-14e8b5526e94	aaf66c75-8f7a-426d-a147-638cd484e1be	1	1200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.708	2026-02-02 10:42:32.708
bdf4d6ec-4114-4c33-ab3c-9ff2842cefb9	daac7a04-51dd-4004-9d43-bb6917c456dc	2	100.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.709	2026-02-02 10:42:32.709
a181ffa4-debf-4f73-8b39-74fab38f8a49	7fc34945-4c15-4ad4-b54b-fef05dfbcdca	30	100.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.71	2026-02-02 10:42:32.71
6856b6ac-f2d2-45bd-b555-ffd73a327220	1a3830f2-9c0c-4ac7-9c78-db65861e81da	207	60.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.712	2026-02-02 10:42:32.712
28d1ad73-cc92-487e-9e29-8409b6438174	1ae858ea-0c43-42b6-acc8-1ed75db6f997	34	80.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.713	2026-02-02 10:42:32.713
45e6bb9f-8b8b-4e6d-86c1-05d2e55cc7b1	2d40c35e-a9be-42e9-be22-5b0728470d56	2	280.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.714	2026-02-02 10:42:32.714
d622a0d5-1565-4673-b342-c13e0ec419a4	6c45c9b6-b50a-43e3-a819-4c0c17b5ffb2	7	120.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.716	2026-02-02 10:42:32.716
3ddb8062-6105-42ef-988a-92a36f9049b9	0db1735a-c6e2-4bb8-8c41-ce08edac9855	1	120.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.717	2026-02-02 10:42:32.717
6655ea30-0c30-46d6-be12-44ed7075fca8	c839f22e-6ffb-4da2-b6d1-de38bd004bc6	1	920.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.719	2026-02-02 10:42:32.719
41c2fa07-b215-4a8c-bd5a-491be8b61350	a52e05af-7a1c-4ad5-a712-b05c4ea9ddd2	2	750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.72	2026-02-02 10:42:32.72
8d9ba4aa-5f33-46b7-be4a-4444b2088185	8b60d05d-5963-4baa-b428-52df8f4bba78	12	180.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.721	2026-02-02 10:42:32.721
e4d67d2a-c4ae-4f23-ac8c-82545fa2472f	6a8ee8c9-8d13-424e-a638-32e79ced7542	11	280.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.723	2026-02-02 10:42:32.723
efcb1a26-b49e-4cb8-a23b-335f6787bbcf	90b6cf5c-bf6c-493d-afc1-a014c4e59ee7	8	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.724	2026-02-02 10:42:32.724
a0965e36-022f-4b03-99cf-47b1b2767af8	d1ed3fef-2a2f-4008-9f36-c21c008c9af4	15	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.726	2026-02-02 10:42:32.726
30f42024-fcd2-433d-bed6-1f16cbd3a082	f16afd06-559f-4476-bf65-f558a58d7a43	3	700.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.727	2026-02-02 10:42:32.727
8db49c5a-483e-466d-a7ca-e5ed7017574f	30e324aa-9e5a-4637-8f29-557b0897de36	6	29.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.728	2026-02-02 10:42:32.728
3f384444-0db1-4613-9baf-887742762a6c	fc00e4c7-c4cb-42fe-955f-f4c9f64d8d6a	40	4.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.73	2026-02-02 10:42:32.73
7b964cde-34e8-4de5-862e-d5ec37f45163	1455abd7-1e3b-4519-a097-69e540208ccb	239	85.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.731	2026-02-02 10:42:32.731
55628855-dc64-46a3-b5e0-a37196b95cda	c5c0f077-8972-43c7-a8bf-0e69a515831a	45	265.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.733	2026-02-02 10:42:32.733
7a26b69a-2f95-41b8-82b8-8f037a67218b	c0df9410-6931-4b26-ba41-d72e52b132ac	50	60.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.734	2026-02-02 10:42:32.734
6fcd0ad6-b08e-43d8-8d9e-b6f8b9faa301	38b52efa-b69d-482f-a8b5-fadab4facc2c	48	77.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.736	2026-02-02 10:42:32.736
52746f33-6196-4370-8cae-a3d40e0a8305	9befb9c0-ea04-44d9-b0da-763a54a0bb97	50	58.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.737	2026-02-02 10:42:32.737
4785ff1c-ce9f-45e4-8f0c-5793ab614cc3	ba3b49f8-180e-4fee-817e-8835c00dd46e	12	80.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.739	2026-02-02 10:42:32.739
86f382a9-5952-47be-b149-88157bfdda06	5f0a8b83-c8b6-47d0-9e6a-5a7145d78406	39	48.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.74	2026-02-02 10:42:32.74
d9221300-fa42-45bc-b3a1-4008d9d3f3da	6fc1db4b-1bfb-4770-85c6-f79af48b377a	51	103.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.741	2026-02-02 10:42:32.741
4e71b992-dfa9-46ab-be05-27f145dcc521	dbfe0eaa-34f9-48c1-84ae-9aafbdb96207	18	43.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.743	2026-02-02 10:42:32.743
726ce511-0707-404b-8a01-a2b9c5c92fb6	792735e7-c3ce-441a-8965-c6a444b32660	1	863.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.744	2026-02-02 10:42:32.744
2694527a-baf1-4d22-b3ae-63da08ef8c83	526637dc-d1cd-4914-b472-7e23f6b39ee9	18	35.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.746	2026-02-02 10:42:32.746
bb9615e5-8fb0-402b-b3b7-8668068f1043	60f8f2cc-3789-4912-bfba-7ce307e493bc	1	12.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.747	2026-02-02 10:42:32.747
704332ad-fe47-4ceb-b1e2-23c74d638fc9	674468ed-8037-4f54-89cf-a6c846c44e76	1	83.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.749	2026-02-02 10:42:32.749
6c36d78f-11ed-4f63-bb31-cb9d508eae4f	1434fcb3-864b-41b6-be58-94a893946b86	1	120.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.75	2026-02-02 10:42:32.75
68f148f1-ef16-4426-b1ba-a11b54719149	0cd0fb43-c5ed-4dea-b33a-971f6aaccfc7	12	32.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.752	2026-02-02 10:42:32.752
8663d226-0748-4a25-a023-2492b7b210de	32b60472-dad0-4892-b71a-7c10fb33b1f1	19	30.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.753	2026-02-02 10:42:32.753
92dd5f9c-277c-4a5f-a6a8-77c2d8b335f9	4381510a-1e3e-4d41-bea2-eaa4fcc14d91	5	184.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.755	2026-02-02 10:42:32.755
510c81dc-4b22-465c-aa53-94ceed21dd4c	a2218f32-7662-46b2-8e2c-5d6f9f649a0e	1	250.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.756	2026-02-02 10:42:32.756
6c6826b2-3272-4485-93a3-cccf8642b506	430035f2-1483-49de-85b6-00564586e79a	13	127.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.757	2026-02-02 10:42:32.757
33c80baf-b63d-4c8a-9c9c-4f428e30938b	ad352165-a70d-4ff4-9aff-84ad67fad98f	1	16500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.759	2026-02-02 10:42:32.759
513b1fbd-c22a-45cd-9853-4785cdf743c2	06ded0ae-387a-4751-9022-03a05c370c30	3	18000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.76	2026-02-02 10:42:32.76
c1581053-30a4-4365-99b7-c4af7be7d6ae	c19b1171-18ad-49ee-9b4d-a941a2e43d46	2	19550.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.761	2026-02-02 10:42:32.761
0227aa1a-ede2-4f78-8329-b3b72389f424	a677df9a-6ed6-495f-ab4b-afde9005dcf2	2	14375.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.763	2026-02-02 10:42:32.763
6d9111dc-bb12-43a5-b0fa-d54e9cf83ae7	89911c6f-e681-4c31-8f55-4095ef1bd1e7	15	500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.764	2026-02-02 10:42:32.764
3722ff9b-9582-451a-ab1f-d5bceb9e874e	e9a1d082-83ab-4e40-b866-2b5906c856a3	7	350.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.765	2026-02-02 10:42:32.765
c3688349-acf3-4ce0-b75b-162944212b77	f39c6554-30d9-4f94-8cdd-ba1a7b36627f	99	230.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.767	2026-02-02 10:42:32.767
2d95f595-8177-4261-982f-31e9d289d22b	9781ccfb-bd5e-45e0-9105-42eac9ee30e9	20	300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.768	2026-02-02 10:42:32.768
5882f0a7-c2b2-4252-8422-351adf55d5b9	15cbe780-327c-4321-969a-6b31cff51047	1	1380.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.77	2026-02-02 10:42:32.77
b1a504b6-2966-472c-b5e2-3a09bcef5eb6	cfe2ab2c-5487-4fe9-8c53-02f7f49efce1	3	850.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.771	2026-02-02 10:42:32.771
472fead2-e0fe-465d-876a-09f971e6e077	e2901df5-1d67-4f7b-98d9-9b0493adc3a9	4	3500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.773	2026-02-02 10:42:32.773
bbd64550-b5b2-4018-9c1e-73d822998555	1df318da-77c6-4fd0-8831-11b49e61c646	1	16600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.774	2026-02-02 10:42:32.774
de8b4224-46b1-46b7-8a43-0e7f93de14ca	a30c1aac-4843-481e-8a3c-092a90c6cda2	1	4000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.776	2026-02-02 10:42:32.776
76fbfca3-1e1f-49ba-b26c-5ed7ce01f2ea	f90df55b-5384-4561-b738-610cd4f86ae9	1	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.777	2026-02-02 10:42:32.777
809f57e6-face-469c-ab65-1f88b87ffd01	d83e5e77-a8a6-4ddd-8a96-39a33f1057e9	1	4600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.779	2026-02-02 10:42:32.779
86d06108-19da-4da7-89dd-9ea368bb6b59	82e24c30-951d-4d7b-bd34-674802802ade	3	5500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.78	2026-02-02 10:42:32.78
7849a0c1-b197-40d3-b89c-3ea355ca5260	622b79b6-bb83-498d-8073-ee7c992ffbfb	1	8500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.781	2026-02-02 10:42:32.781
33e2a2ad-f42c-4a8e-8afa-136efdacb099	0ef9f35e-205d-45c0-a555-c110b217579e	7	288.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.783	2026-02-02 10:42:32.783
0dff6f34-ae1f-4dac-98c3-cc2eeb84e431	a4ce5895-0c23-4c99-b283-f9917423c6b3	2	4000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.785	2026-02-02 10:42:32.785
0adf8e9e-488a-47c7-8161-6fb4963b7795	610db2d6-7023-4c60-aafe-d4fa0aba7596	2	1100.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.786	2026-02-02 10:42:32.786
92602a50-64ac-429e-9eb0-0e49bf229fd2	e175f424-25be-49e4-a3c1-faed0d700c00	5	1050.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.787	2026-02-02 10:42:32.787
843f4222-785b-4f29-8a7b-897e67f373be	24062761-bc5f-44f1-98d5-f9226e007d18	1	14500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.789	2026-02-02 10:42:32.789
bbef7d74-d41e-4365-8777-2ae5c7999d2a	a20f98d8-20eb-427a-8c22-3746a426e609	1	8000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.79	2026-02-02 10:42:32.79
8305f534-735f-4797-b99c-8d3dd0bbf59e	5d7937ef-dae6-4d47-b1e9-dcbac7d35dc9	8	2530.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.792	2026-02-02 10:42:32.792
eeb27288-5230-4b56-a1bd-3a723a616038	9c826b8e-e018-4184-ac19-ad918f804518	1	7500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.793	2026-02-02 10:42:32.793
c3c1c213-82a1-4b44-91ce-6c252700d9da	6ebf112e-45fd-4997-9e02-9492b0b374b6	2	4100.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.794	2026-02-02 10:42:32.794
5ebb8660-6d01-4010-85dd-538868c5abd0	c72b747d-3a2a-48b5-9508-577431b28ac4	1	6400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.796	2026-02-02 10:42:32.796
604ad4e5-f9fb-4bf5-9313-6d2473c57971	d0dfdfa4-708e-4ba0-b81b-fd1291a2d8f6	1	6000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.797	2026-02-02 10:42:32.797
ba372471-b07b-4242-91cf-35ab1907f23c	b709fd91-91f2-4eed-859d-7071baaadff3	3	550.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.798	2026-02-02 10:42:32.798
ec152be7-7282-45aa-81f1-41aac2acca90	81f31321-d10f-4772-b119-4be4ba55a4d4	2	900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.8	2026-02-02 10:42:32.8
4c9422cc-bcc5-4728-8be7-e1f41f723e94	92331fdd-5700-4fb6-82ba-cbdff6b59472	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.801	2026-02-02 10:42:32.801
6c29ce90-d530-4cf6-aa69-17d8222bc250	cdb4ce91-b899-4b2f-a84b-3f03c09b8f65	4	750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.803	2026-02-02 10:42:32.803
04284d45-8966-4df2-915f-8fdce6655503	41468fa5-3727-4f26-b50e-3f37fd0ccadf	4	1150.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.804	2026-02-02 10:42:32.804
a02d545a-2e05-44b0-844e-55e510cac52d	c3f21e1e-2c5e-4b70-a6f1-98e58d99f0a8	1	2645.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.806	2026-02-02 10:42:32.806
f3f9c325-081f-4c03-bc14-6c4385aa3b28	acb9b711-6cf7-412e-9086-32e5b56041e9	2	6600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.807	2026-02-02 10:42:32.807
8279a372-2ea9-404b-98d1-5af94fba4396	1b8a691d-65fa-42d0-a80b-0fa8944e4d7d	80	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.809	2026-02-02 10:42:32.809
e20d7ec7-d1ae-4c95-b77c-e42ee5709f1b	dbaf6c57-773e-44d6-aa09-270d862f7569	26	450.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.81	2026-02-02 10:42:32.81
4e8a9904-bb06-4e44-9dc1-555472faa83f	9835fcdc-fb33-4341-9b07-c6aee3244799	98	16.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.811	2026-02-02 10:42:32.811
69ba1821-284e-4f9b-b623-f38c7c26ca5b	529e8611-7762-452c-8fd0-f666cf58b1a3	981	9.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.813	2026-02-02 10:42:32.813
9a65f7cf-4922-4526-83ba-9eec5753b613	374e9d73-7e9d-479c-9f05-b82f96ed1782	953	4.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.814	2026-02-02 10:42:32.814
879655d4-f84b-4ef0-b9d9-058b8b29d14f	9f8911a8-feb3-4f9e-8f38-c37a4e11c50f	37	10.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.816	2026-02-02 10:42:32.816
3d5bac32-f531-4576-91b2-40bd7cd769c4	ccebb85f-79b5-49f9-9ff2-2bccfaa65139	1	220.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.817	2026-02-02 10:42:32.817
576d12d4-c8d7-49ad-9ef7-860c2faeb2c6	2d209dc3-85ca-4f4e-b5f5-1cefdcc6b3cc	3	200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.818	2026-02-02 10:42:32.818
0713cfbb-eb99-4ea6-87f4-516b66a5fa69	88e8c5d9-e822-4562-ad41-7e0056993548	1	250.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.819	2026-02-02 10:42:32.819
cecbf438-744b-439e-87ab-92feb0de2923	284505af-e81f-4461-8fcc-f31798745b1a	5	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.821	2026-02-02 10:42:32.821
620c3f8f-2f75-4641-a555-f9a473a6e695	4706386b-c7b0-426c-9f18-627e153283b1	2	2100.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.822	2026-02-02 10:42:32.822
626e398c-6d55-4818-9cfd-7dfbf054f064	fd87ab4e-fc64-470f-a536-f4dadc9f8628	5	950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.824	2026-02-02 10:42:32.824
30b4afa6-dc62-4e1e-b15c-f8e716ae0261	3dfb1a5b-717c-4375-9ac4-888ffc49115f	2	1850.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.825	2026-02-02 10:42:32.825
f110758f-1f2e-44f1-923d-fe50492a8e90	b3cf7b4b-125c-4810-b5f7-ff2235c9348c	8	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.826	2026-02-02 10:42:32.826
671386dc-1a94-4db4-a50c-f665fb0bd85e	bc5c12f5-4443-4da8-8715-1118b741683a	1	265.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.828	2026-02-02 10:42:32.828
a71e4a35-4711-4e9d-9512-dc2a73c800c8	db5f473a-ccea-4bdb-9ec1-12c429e131b7	19	695.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.83	2026-02-02 10:42:32.83
c389b439-ceeb-4ee5-b27a-66f7159e7d58	6e3c08bf-5a87-436c-aa09-9bdd56756654	64	995.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.831	2026-02-02 10:42:32.831
dcc07156-35ca-4f43-9b1c-1081bcab0055	b9b1c160-606e-48ba-98db-1bee17d2c1e0	1	6000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.832	2026-02-02 10:42:32.832
17f9faaa-1302-4948-a4bb-8f8ef088ed47	a7ade9a3-cf08-4269-bcb7-b69ab44a30f0	1	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.834	2026-02-02 10:42:32.834
e9e6e261-a267-4779-b17b-4dc5680ce017	1fffdd35-d391-4499-922e-9160e97dd0ee	1	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.836	2026-02-02 10:42:32.836
3863fa24-4db0-4d45-9c8c-02a24ca3bc58	370275c4-bb1b-47de-8795-e77141fb1711	1	2200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.838	2026-02-02 10:42:32.838
6e5f5e9c-4e90-4395-8290-23401383114f	e53a93bf-ded7-43bb-af1f-2c1fed046ef2	1	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.839	2026-02-02 10:42:32.839
2c927f7e-d0f3-4cb2-b8d9-ce471364def5	58b263e9-e339-4adc-955f-e7773483c951	1	2000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.84	2026-02-02 10:42:32.84
ea4569ab-c9a2-476e-980a-daa0b02740b4	9490b909-95d9-4b1d-8ef0-c60fb1f2592e	1	3000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.842	2026-02-02 10:42:32.842
c91a9712-7bb0-4c61-8ba8-07ec9d18faed	31a10610-7d05-430f-a636-eb3688d41815	2	18500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.844	2026-02-02 10:42:32.844
d89ab781-eeae-4717-9776-3b613ed35c62	c280f5fe-0c55-4099-a489-a609d74eddd4	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.845	2026-02-02 10:42:32.845
1b1206f9-fdb1-406c-8b9a-141aed75121c	78eb7c6e-4c1a-4e15-aeca-a1262599fd0e	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.847	2026-02-02 10:42:32.847
f0d5f7f4-15af-47a5-a416-5eab64cb2c49	248aa191-249a-4fd7-8a78-28d21d4f0e21	1	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.848	2026-02-02 10:42:32.848
5aa57d32-417c-4f2f-b34f-04f2cd1025ee	d6897bc5-c3b5-4ed6-952d-f4e73f58728b	1	4500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.85	2026-02-02 10:42:32.85
9d7fbfa3-4920-4c73-969a-99ad7acf4502	99e8662d-c122-4960-9c83-b941ee19b8e0	3	750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.851	2026-02-02 10:42:32.851
a0bd9221-7085-404e-96d7-23c71fffe7c3	f56f5d2c-fa01-40a5-a37f-db2fe4e41fee	2	2500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.852	2026-02-02 10:42:32.852
1e71ccee-d9e4-48fe-bbe7-2efe6fbeeaa6	10dc8aa2-e2b3-4c32-9eec-4b6cc778369c	1	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.854	2026-02-02 10:42:32.854
489725cb-2e9c-4368-844c-c5005ee62085	54256018-de44-4614-89f7-9465b603181a	1	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.855	2026-02-02 10:42:32.855
44fe65cd-d351-4058-bb6d-22166f89fdbd	29d75b3d-c06d-4ec1-b56a-1a3ef90e188a	1	16000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.856	2026-02-02 10:42:32.856
5095e04e-59f7-406e-ad1d-2c3d9345f8e9	720f357a-45f7-441e-bff1-d7d84426048f	1	2500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.858	2026-02-02 10:42:32.858
12944c09-27e5-483e-8ca2-066fbf692d54	c6659a91-dda6-445f-a6af-202f4ff11dbc	1	14500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.859	2026-02-02 10:42:32.859
dc259522-7ea3-48c3-aec7-4e13742c0da0	a28e053f-7b62-4927-b4b0-398401acc548	6	14300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.861	2026-02-02 10:42:32.861
5ea372fa-13a6-4789-8a89-812d957dd8fe	7cefb3ad-37a8-48b7-841e-71c86b9fcdb3	1	14300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.862	2026-02-02 10:42:32.862
11ce4e77-2e80-47fc-8235-3017d6e6f1ee	97fcaacf-48d3-47b1-b81f-f032f74d47fa	6	11500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.864	2026-02-02 10:42:32.864
fbd25f1d-1551-4596-a9aa-9bc2159a9a88	7f30ad8e-cbfd-414f-ba9d-0bc80816d7de	1	11500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.865	2026-02-02 10:42:32.865
1495e362-f8de-4246-a6d2-f87dd3ddf551	3f01d329-0cb6-46e1-ad25-7e1f26838196	1	32000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.867	2026-02-02 10:42:32.867
7c49fe34-dcdd-4888-aecd-cb39bf813915	8e6e8d18-8d2f-4d06-86f8-8c6f366bed42	1	40000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.868	2026-02-02 10:42:32.868
6c73c466-2a55-47fa-8e30-87d6f74110f6	051e9f3a-9de1-4337-ab7d-42ff708ea03b	1	28000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.87	2026-02-02 10:42:32.87
ac8b7a97-6c4e-46be-9c71-147dd74c4681	2950a805-6ce1-4775-a0b1-ba7245f61ab6	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.871	2026-02-02 10:42:32.871
ba0585ed-4997-4a12-b9aa-1520ccab74fc	c7873b15-492f-40a4-b442-d0fafa6602e3	1	11000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.873	2026-02-02 10:42:32.873
07089852-c9bb-4158-9a28-7137aaf00504	89990668-220a-4bcc-ac6b-2f72a9ba6466	1	2000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.874	2026-02-02 10:42:32.874
fe734077-c757-43ed-9b43-c64f2bdb3893	7931ff9d-7b4e-488e-845c-43cacf512d7f	1	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.876	2026-02-02 10:42:32.876
0862dcf9-4297-446a-837b-6893c47c3a96	bc2ca9ce-6c43-4d57-838a-d0404df26236	1	28000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.877	2026-02-02 10:42:32.877
4332c86b-9044-47d1-8ae7-9a192117f7b5	6568b940-6b1c-4c2f-bb10-aefee7476459	1	23000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.878	2026-02-02 10:42:32.878
6dff6eb6-a14c-4c36-8270-d27519b2a946	4de61992-f9a7-4837-9205-cc88d5da5e01	7	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.88	2026-02-02 10:42:32.88
2a649282-eca1-4007-b03f-162c2fa3508b	173dc4f9-6496-4f34-9696-a6830731008f	3	2300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.882	2026-02-02 10:42:32.882
ce039105-fbc6-4889-b6ca-2de20397aeb4	97aa8303-071e-4598-9b0f-b2275d042e9a	1	950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.883	2026-02-02 10:42:32.883
ba82398e-93f6-472e-9961-b907d047ff2c	e55f10a2-0d79-4647-b168-d004d782d06a	2	700.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.885	2026-02-02 10:42:32.885
91bbbce3-200b-4ccf-9e0a-110e6d37b140	580d41db-d45b-45cb-a65a-bb35c7881297	7	750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.886	2026-02-02 10:42:32.886
535a7b52-d8f3-4ae3-81d8-3461b9a1a8fe	9911172e-1001-41bf-ab6d-22f858409e43	3	700.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.888	2026-02-02 10:42:32.888
7de54182-f9f0-4b86-bedf-041d15933875	90e2916c-f42a-4593-84f7-ee1f0959ba33	1	1800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.889	2026-02-02 10:42:32.889
e433cf62-b94d-4b59-8500-34a36414d4db	64aa819d-d3f1-4a09-8ef4-bd33857b5663	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.89	2026-02-02 10:42:32.89
f6ccc295-49e0-4e10-b652-04341794f35a	9bfdd103-425e-464b-b123-6c0de18c2518	1	5500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.892	2026-02-02 10:42:32.892
36a018cc-06f3-4122-8878-9393060ac17a	68d3a491-be04-4da7-bc25-d4055f17372c	1	950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.893	2026-02-02 10:42:32.893
fac5acec-e0ea-4134-8675-b8f64e63a653	068619f7-93e3-43e5-ade3-050b4f188aa1	1	8500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.895	2026-02-02 10:42:32.895
19780580-ba0b-4831-adad-9a0c9a83cef4	886164bf-7843-4b66-9080-a56bee0abc77	1	4000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.896	2026-02-02 10:42:32.896
425f5148-41e4-47ef-8baa-bdf087cd151e	61e4536b-9f26-4ddc-b5f8-13738ea458f4	2	2000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.898	2026-02-02 10:42:32.898
b32a0b44-3143-4871-82f7-2ee64b8476fc	2912624d-8e86-4123-ab61-5db56bf6a042	1	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.899	2026-02-02 10:42:32.899
3ce9ee65-1f94-4fb2-b2a8-59a65d77aef8	c87f05d0-9a7c-44af-bfef-89b6a3b84da2	2	3450.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.901	2026-02-02 10:42:32.901
b28ef9dd-96ac-4e58-aba7-322d9c8ddc12	f98bf1d6-3736-42dc-b398-d8a111f583a3	1	2600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.902	2026-02-02 10:42:32.902
31c6cd27-0b60-4178-bb72-a0208a8d7d6c	d0eb302b-adf4-492c-a1ae-6d4c09ff4f33	1	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.904	2026-02-02 10:42:32.904
205d89d0-5556-424a-ac38-0e4915b3b6c5	2af9d689-d656-482b-b2eb-d4529cec8bcd	2	2300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.906	2026-02-02 10:42:32.906
350d0f6e-afe2-48d6-8155-ac1f4604cdb2	463b5058-3e42-4bad-b251-ce071f9c14b9	1	750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.907	2026-02-02 10:42:32.907
c4f18eb9-e471-473a-97af-2b67dcd692e1	11b2e949-ad2d-40f8-becb-6c086f139d60	3	1500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.909	2026-02-02 10:42:32.909
e719abe3-4d87-4a36-8220-930e5822a18d	5a6479b9-d105-4d8c-aeb1-7eaac34f2796	1	450.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.91	2026-02-02 10:42:32.91
fd975a56-53b5-4b46-93ff-c3e716020acb	e350dc31-ebd0-4d10-922a-55dbfccf6a4d	1	6500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.911	2026-02-02 10:42:32.911
76b63c11-dd20-4828-958b-57f57c741ee2	0e1ac318-2020-4f60-ba3b-519f720c7834	6	8700.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.913	2026-02-02 10:42:32.913
91dfc811-5b3c-4dec-88cf-042aee768702	50502ad5-abea-4d60-91a0-578e4ba9cf32	3	5200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.914	2026-02-02 10:42:32.914
f4f63df4-b798-4490-8f1c-ce05727a8f61	ea68ca1e-3ba7-41d7-b0d7-0b9bea6c52f1	1	4700.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.915	2026-02-02 10:42:32.915
9ecfc9ab-d8e0-4141-ac0a-093f6300666e	d5e91b64-635c-42fd-ba34-881d3169ce76	4	550.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.917	2026-02-02 10:42:32.917
b0eb7fe3-5982-4228-bbb0-19733f357214	751ef86a-b0d2-4a4f-9cc1-8cea9cdc1a4e	1	3200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.918	2026-02-02 10:42:32.918
c7fcb587-f73c-4411-98ef-8086893426d4	0e059888-8954-4d86-92af-4c415c0cbb7a	2	3900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.919	2026-02-02 10:42:32.919
63079044-d2c6-4a04-a1b4-b88ece86a645	698670f7-533f-4953-b962-ae5c90b7a48b	2	2900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.921	2026-02-02 10:42:32.921
52d66173-d4c0-4325-b400-06d419d75872	03553045-b7df-4f46-a984-88e8664fd7ed	1	4000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.922	2026-02-02 10:42:32.922
1359ff3b-bac4-4cc7-926b-8e7dff843df4	099613c0-f32b-431d-9767-ce75bb76f710	1	13000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.923	2026-02-02 10:42:32.923
55159974-f988-4743-8d9d-124a50a7f788	5a1fdfa3-cce7-44fb-aab9-a31d96d56336	1	19000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.925	2026-02-02 10:42:32.925
8ee1ee10-a61c-48f2-875d-7aeaccdf4e0b	e8e6c428-4ba0-4a79-abd4-5f0385d78cf8	18	650.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.926	2026-02-02 10:42:32.926
b1488982-81e8-419c-bd28-f466e20b3732	97212943-c08c-49a9-9501-e0328764f533	1	1600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.927	2026-02-02 10:42:32.927
46a05676-5e03-4e1f-836e-3ecf465a9033	f064d3f0-6578-4ca3-b223-f0dd1c676d31	19	140.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.929	2026-02-02 10:42:32.929
c80e2052-0395-4288-83d4-a9c392fb8371	9005b15b-e3b9-47ab-be0f-882cbd15994a	121	80.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.93	2026-02-02 10:42:32.93
b6a21522-9690-4265-9545-676a3a1c954c	a8f80883-255e-4dbc-b61b-3028736c1788	4	300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.932	2026-02-02 10:42:32.932
bb98ac01-adec-4a36-a0d4-050e6a6ba14f	cc2d9c8a-ad2d-4433-aecf-7017eebe5651	61	80.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.933	2026-02-02 10:42:32.933
9d4ba6f8-447d-440c-9086-dde1251e5a69	ec4a1696-791a-46a1-93b3-2f40bbf341d2	28	80.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.935	2026-02-02 10:42:32.935
4285391e-da0a-44a7-a25f-719fe7c933fa	3de90d75-7ae9-4cd2-8fdc-0fda5ce52883	1	1150.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.936	2026-02-02 10:42:32.936
f322a647-345f-4295-9231-746a7fbc8378	1be5db14-f9c3-4637-b105-17f67182facf	9	1250.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.938	2026-02-02 10:42:32.938
582b4f32-5b47-491d-bf7d-ec0921e88442	8043bc09-8a93-42b1-b71c-ff9d87704b82	2	750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.939	2026-02-02 10:42:32.939
4a70aad0-c919-4893-a5e1-3cce9b7bedc7	dcb6ba58-ce65-4294-bf31-7a20bf8f7a52	8	1150.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.94	2026-02-02 10:42:32.94
b6505493-3906-41c8-8638-1b9d366dfec1	af048db6-ffcb-4160-9793-576ec6aa5459	1	9500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.942	2026-02-02 10:42:32.942
fa572c81-d48f-4be4-8dff-6304529e4086	6787fca5-e572-49ba-b070-a31329a7bbc7	13	1350.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.944	2026-02-02 10:42:32.944
3696aaf6-2f3d-46c5-833f-dcaa5bc1e719	3e79b71e-fd20-446b-b656-2aff9805fb6e	3	5500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.945	2026-02-02 10:42:32.945
e3772956-7bdc-4299-a691-b990d0c8c2b0	57cca944-c1b0-4458-b04a-731736644451	1	19500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.946	2026-02-02 10:42:32.946
d4c2ee8d-bd1a-44f1-a6ec-be6a440c25d7	c3a4947f-c73c-42f1-8763-e0e8bda3841b	3	4300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.948	2026-02-02 10:42:32.948
9f8b820e-5fe0-4d0d-8154-96f1410ae985	0e7ecc9c-7334-4e9a-b128-027de6634264	4	3400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.949	2026-02-02 10:42:32.949
e3ee342e-fd04-4d98-a57f-2039dc06e6f1	67ff2ded-7063-4e07-9675-22ed8739bc4e	2	3500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.951	2026-02-02 10:42:32.951
6f2d3244-be34-4e51-846e-3aba812d66c9	64bbc285-fae5-4665-b02b-356557389956	2	2500.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.953	2026-02-02 10:42:32.953
f993ea29-08b2-4b2c-80a9-647aad9dfc85	d4b0f9c9-8b4c-4ab5-89f4-cd20a3b15262	2	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.954	2026-02-02 10:42:32.954
632e59b4-3bba-4c32-a82f-49ae8ed4c300	b99ec6db-b63b-4036-8659-92fd8e44e115	3	1950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.955	2026-02-02 10:42:32.955
ec22bb4f-e97f-4c09-9984-4321c829fb2f	e62d544e-8092-4e11-8909-a564a4d118a7	3	3600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.957	2026-02-02 10:42:32.957
e0b85767-5641-485c-a451-07d8bb3f5e67	d8b04dee-ccc0-426e-822d-c4c500d6a647	8	3600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.958	2026-02-02 10:42:32.958
fee8a467-3d72-47b4-89cd-cc24cd38099c	be8d297c-b81a-4be9-86b9-39a3bb812ffd	3	3600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.96	2026-02-02 10:42:32.96
8101431f-aa06-43d9-b818-f5441fa212e7	45344e0f-6b29-471f-b257-4596cec032e5	2	3450.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.961	2026-02-02 10:42:32.961
72de02d8-2d67-444b-a88c-b384fe227a47	a447d1c0-1496-4dc3-a757-c3796c869d1e	1	2350.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.962	2026-02-02 10:42:32.962
c7103450-504d-4d8b-9cce-7df4d24ec31f	f00ba684-fd38-4df8-93e3-cf6382c46909	2	3300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.963	2026-02-02 10:42:32.963
9194fca8-0de6-4b0b-9028-b57628f95808	406a968e-8a0d-427d-8745-2eefe451ba8e	1	1850.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.965	2026-02-02 10:42:32.965
23692bed-e6c4-4ad1-a654-edb010070e7d	6ef3ab7c-8a66-4b2b-b795-1823249202fa	1	3250.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.966	2026-02-02 10:42:32.966
9d5a7826-b775-441f-8003-5067bc94aaeb	97c0371c-9245-4947-be66-755ebbaa338d	1	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.967	2026-02-02 10:42:32.967
4ce1e2d9-acaf-4785-9c60-d919b82e3457	571565c6-ec58-4720-81e0-c2ff230ae295	1	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.969	2026-02-02 10:42:32.969
e8ea6d85-7e29-440a-a4ba-9713fba34900	6e999108-cf80-426c-aefe-c794847ac9e4	3	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.97	2026-02-02 10:42:32.97
d8d86ab1-5318-4370-bed2-4105f7c82a0b	2a180763-c7ff-41e0-b626-07ae5e031c34	1	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.971	2026-02-02 10:42:32.971
dc1cbba9-1698-4a91-a08a-c8e314ac58d9	0d568669-7da5-418a-970f-fd125c52bf08	5	1850.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.972	2026-02-02 10:42:32.972
d0b5f9b2-65eb-4693-a659-bae94d98c739	a808176f-82cf-4a46-a9a0-50ccf8dc924d	1	2200.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.974	2026-02-02 10:42:32.974
61c6dd9e-7256-4b4b-bf2e-fd96719a1dfe	1689b10d-c6af-4771-b78e-0e54a0c84471	2	2600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.975	2026-02-02 10:42:32.975
80426611-6f19-4c5c-a4bc-63bf7a5efb2d	91dc15c2-c867-46a9-8dc0-5102bb40bc54	1	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.976	2026-02-02 10:42:32.976
0899ecf5-f664-4a2b-874c-3bf63ff2805f	71130377-0c9c-487d-a6c2-96e33c982ce5	4	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.978	2026-02-02 10:42:32.978
cce3a3cc-e064-480f-b0bc-e3f8e012aca0	14062665-be8d-4d54-a91c-23e4cefccade	10	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.979	2026-02-02 10:42:32.979
fc8e6664-27f8-4a14-a85f-ad78245d0faf	fd1921fd-e1a8-45da-a137-f4644082ed8a	3	1600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.981	2026-02-02 10:42:32.981
10f3aca7-f20b-4c5b-9efa-515224014178	dbb32f2b-65fa-438e-87b4-52ed42e7b5e0	1	2800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.982	2026-02-02 10:42:32.982
be5911c0-33fc-433d-af44-37b0332dc176	2d91c476-a2ee-48e9-beca-a6291c024bac	1	11000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.984	2026-02-02 10:42:32.984
7799ea77-89a4-4942-b27c-40306897047f	24f7510f-7818-4938-bd97-6c2552c3cc74	2	9800.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.985	2026-02-02 10:42:32.985
27ed4ef2-657a-4e2c-bc86-fa98809972d4	1f8d1a11-950d-4e7e-a27f-5b497ab1cdbf	4	2150.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.987	2026-02-02 10:42:32.987
798bf544-3f97-49c4-ac74-57fe28813442	b2f4ac11-1d65-4beb-9435-c32a1d415d86	1	2150.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.988	2026-02-02 10:42:32.988
d468d7ab-f4a2-4eb3-8496-4c9e8ce91c21	eadcd941-1be9-41f2-82bb-300d3850134d	2	1950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.99	2026-02-02 10:42:32.99
083a652e-49ef-4365-a57a-723847d94e13	61d60445-bae8-4fe3-9d4c-24e1bb955678	1	1950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.991	2026-02-02 10:42:32.991
0d5f0684-bcd0-4c3c-89ae-30b4aa326957	425e7cc4-dc59-47ca-a4ce-52de12fc3bdd	6	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.993	2026-02-02 10:42:32.993
bfc6f4df-3635-4622-8130-db2ec545bb3c	6c093fbc-d6f8-457a-8f90-3abb01d28c1a	2	1250.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.994	2026-02-02 10:42:32.994
76cc6c0d-5b5d-44f5-a2a0-893604a2e5a9	61a64c00-25ca-4a51-ba7c-3ff4bf33fec3	4	1050.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.995	2026-02-02 10:42:32.995
c65b36fd-1074-4b8e-8b20-255b7472548b	304c8bd6-63bb-48c7-a21d-3dd9a9a979b6	9	1350.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.997	2026-02-02 10:42:32.997
c12139e1-f85c-4d7a-b373-c74cce6d8373	3835bbb8-dd2f-436b-940c-88ce3f70dc5e	1	950.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:32.998	2026-02-02 10:42:32.998
337924df-1791-4aba-8bd0-7223dcad7c54	7c242ca0-4055-4454-bb27-f347054fd76e	1	3000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33	2026-02-02 10:42:33
02aae817-d721-4f08-a460-ac4b16319fcf	a6b66ece-689a-48b9-bf72-ac08604afaa4	2	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.001	2026-02-02 10:42:33.001
110f7070-45d1-4bee-a2f6-ca631dc4e306	91e504ca-03f1-4304-9d0a-c457df357788	6	1600.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.003	2026-02-02 10:42:33.003
72db0524-1248-4554-845e-d1ba7a4f5f32	9114b74b-8f46-4f14-878e-6944987ee190	15	1400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.004	2026-02-02 10:42:33.004
6157ffa4-bc4c-4023-aa02-8cfe4a0a2b8b	dcd03dfe-b188-4d32-a461-7651c3bb89b4	1	1300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.006	2026-02-02 10:42:33.006
c2b1190a-58f1-4544-8753-242f3b2f5756	d788f4fb-9080-4eb9-a1a6-72451f949889	5	1300.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.007	2026-02-02 10:42:33.007
0e2abb21-21f3-42b3-95b6-b9fa7c1288eb	92a78937-111a-4689-8d4a-35635814a1da	4	1750.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.008	2026-02-02 10:42:33.008
f4b70211-5153-4160-9d99-ee45419be734	108092ad-ee60-4e08-a840-a40475406920	1	2000.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.01	2026-02-02 10:42:33.01
6a9f4e6c-b129-4ea0-a154-eba2900ca4b1	682fde8e-865d-4c93-8769-a2ba8f91df70	1	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.011	2026-02-02 10:42:33.011
cf90e9d3-6568-46bc-888e-5b114eab32e9	4dd14f80-b299-4e7b-8c3a-1472e21957ca	2	1900.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.013	2026-02-02 10:42:33.013
79c7ba24-2ba6-46c2-be89-86aa09748056	86300ff1-3cf6-4ff9-a739-791ecdf7c99f	3	1850.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.014	2026-02-02 10:42:33.014
cd929e08-6a21-4dcd-8f1f-ac5407e671f1	04d9d51c-c68c-4654-98b3-aecb0d390fd8	1	5400.00	\N	\N	System Start Stock	FULLY_PAID	0.00	\N	2026-02-02 10:42:33.016	2026-02-02 10:42:33.016
034ba0f6-901b-4f53-bff8-0528866d1757	6d352ab0-cd0b-4d39-8bde-9cf8993c5d50	2	6325.00	\N	2025-12-31	N/A	FULLY_PAID	0.00	\N	2026-02-04 11:15:38.383	2026-02-04 11:15:38.383
aa142098-106f-41a8-8277-cca75184d4d3	abc68e86-5212-4ad1-957b-2305d5c74575	1	97750.00	\N	2025-12-31	N/A	FULLY_PAID	0.00	\N	2026-02-04 11:18:15.015	2026-02-04 11:18:15.015
ec92cb24-692b-4e47-b525-97ae44c7d494	d7e2cca1-7fd2-4264-ba3d-9d6a5bd8c10e	1	10350.00	\N	2026-02-02	N/A	FULLY_PAID	0.00	\N	2026-02-05 07:13:22.516	2026-02-05 07:13:22.516
c5818e84-ecb3-442d-934c-0794925b312e	3eae3eed-fb49-4adb-949b-6f9ee061e5a7	1	21850.00	\N	2026-02-01	N/A	FULLY_PAID	0.00	\N	2026-02-05 07:17:14.749	2026-02-05 07:17:14.749
5c293e49-1811-49f3-a07b-0bfad1a43117	d2e1d795-ad2b-45f2-8990-e6d965173d28	1	135000.00	\N	2026-02-01	N/A	FULLY_PAID	0.00	\N	2026-02-05 07:19:41.942	2026-02-05 07:19:41.942
94ae9a36-7468-435c-9490-5d5645d2dbd8	3701f253-1e86-4138-914e-8101c991954b	3	7475.00	\N	2026-02-01	N/A	FULLY_PAID	0.00	\N	2026-02-05 07:24:11.785	2026-02-05 07:24:11.785
06a5d938-387f-4aa9-a9c7-2372de109b26	4b0d5470-c72b-4664-93b0-a47be41e913d	3	402.00	\N	2026-02-01	N/A	FULLY_PAID	0.00	\N	2026-02-05 07:28:15.909	2026-02-05 07:28:15.909
7068ad6c-318a-4fe6-b9ac-d734c52bfb09	8ff630fa-0539-4b86-a850-eae245ac00c3	3	12000.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 07:32:28.2	2026-02-05 07:32:28.2
e25c7243-0ac4-400e-8b2e-06a583cde32c	8ceabf1d-d4b2-47db-9c5e-9b0b05e28007	1	29000.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 07:35:40.057	2026-02-05 07:35:40.057
5d299913-cefb-4120-ab73-5899c6ee3dfe	47c0330a-4659-478a-a9a9-bbdfa4f7a5fa	1	24000.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 08:35:37.024	2026-02-05 08:35:37.024
99b44e4b-ba8d-4764-9566-45f2da012eb1	b117c146-57f2-49cc-8830-5ca52af39dd7	1	28000.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 08:37:27.463	2026-02-05 08:37:27.463
e644fc12-ae7f-4cae-9328-1dee4b9093d5	7fdda702-39e9-4ffb-8416-e4fe9285fc83	2	42211.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 08:39:03.537	2026-02-05 08:39:03.537
3afaa554-3500-4cb0-9d0a-1685592b9e4a	83bb0106-0ba3-481e-ac9a-29fbc2880529	5	16445.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 08:40:43.34	2026-02-05 08:40:43.34
cf0903a0-57cc-40bc-a21a-201a799b7bcf	9d3db322-87f0-407c-8d91-1f504dd0969f	5	5865.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 08:41:36.443	2026-02-05 08:41:36.443
f123f68c-7afb-4999-8e6b-4c745be89181	15b49a04-2606-479a-ab7c-20f0a0384860	5	4720.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 08:42:32.372	2026-02-05 08:42:32.372
5185cf57-bc85-4d54-ae95-fdd89affb0a5	99a286d3-959b-46f5-b292-b984cd13a8bd	3	4025.00	\N	2026-02-14	N/A	FULLY_PAID	0.00	\N	2026-02-05 08:43:25.206	2026-02-05 08:43:25.206
bac2ea6a-d5b9-4be9-abbc-1a6feab4bf72	9da927d3-e7c9-4229-8d82-6212e22c58cc	1	48.50	\N	\N	naol	FULLY_PAID	0.00	\N	2026-02-23 14:24:08.284	2026-02-23 14:24:08.284
13f30b7f-94d0-4a57-aad2-e5e2e48a49b9	ad3338f8-fa47-42eb-9483-84426ac1d09d	3	104.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-23 14:27:19.202	2026-02-23 14:27:19.202
2655bc71-5a97-4cb0-9f69-6b3e28eb6c3c	098073c3-e25f-4c46-af47-1fa60918f048	3	12000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:17:36.367	2026-02-24 12:17:36.367
d6491fd0-0347-4015-a980-270c6744239a	ad0702f7-3c32-44f2-82fc-be89031a36f4	5	2530.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:26:33.683	2026-02-24 12:26:33.683
ada7dfc7-6e48-46eb-944e-fbdf79032ab0	9bf931ec-2899-4e59-a4f6-b4b9f9626e16	5	2530.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:27:39.219	2026-02-24 12:27:39.219
4b823c5d-93ad-496d-9630-a3d5db7d680c	f00c05ad-0bc7-4e18-b67d-d9f804d7fd6a	1	72500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:28:44.464	2026-02-24 12:28:44.464
8fc76956-8493-47f5-9315-a06cefe4ff83	79bd2853-aaa3-462c-a7c5-6bf10b692e88	1	49450.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:30:39.767	2026-02-24 12:30:39.767
adc941a8-4b28-42d6-b7da-c08be124bf93	bd41bad6-2f01-4611-b827-ee04c8b518f8	2	135000.00	\N	\N	Snap Trading	FULLY_PAID	0.00	\N	2026-02-24 12:32:46.854	2026-02-24 12:32:46.854
975568c8-106c-4f6d-b864-4da92b2c8926	ff024bb5-4c61-4cc0-9f6a-132994e67879	2	19000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:33:59.425	2026-02-24 12:33:59.425
0e4ea8c2-3bd9-4796-b452-c8185147f784	e49c7540-8264-4368-9529-41b62ee1c54c	2	34000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:34:49.422	2026-02-24 12:34:49.422
c977cfd6-a79a-4807-9609-706be71c07fd	ee147eca-04eb-42c2-a7dc-e04637b8f00d	3	63000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:35:50.629	2026-02-24 12:35:50.629
dbcf7620-f1fb-4b91-a3c1-323b7fffe37d	0a8c0873-c898-4091-a106-b3d21c41a88a	1	122000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:36:46.367	2026-02-24 12:36:46.367
ea648e0b-f9a5-452c-b8b1-6373c17a89a7	1c9408e9-07ca-40f9-a452-4f70d5105af2	50	580.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:38:01.432	2026-02-24 12:38:01.432
6f1f9434-2d56-4aa6-98a5-baad70591f55	478d3f16-0d5c-4f55-ab92-66b71aafce85	50	480.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:39:16.379	2026-02-24 12:39:16.379
b5c06bf3-7d76-4349-a384-dab9fa491e7f	5ec0c037-5ca7-41db-a45a-d7480bb8849f	10	1725.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:40:30.637	2026-02-24 12:40:30.637
2ea044ef-a333-4830-a797-183fa7d1ac7c	2d4cb7cc-cfc6-43ad-aa47-c2d269321739	10	1081.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:42:02.835	2026-02-24 12:42:02.835
ae9c6b18-6348-4bda-a8b1-6407e6023f65	27653c29-73f8-4219-891c-c91fe2c1fb24	10	1633.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:45:48.894	2026-02-24 12:45:48.894
f284ceaf-3d84-46f9-bb91-b1a6e002af8b	a262ae8a-91de-4057-932a-40ef78a8e9cd	10	851.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 12:46:40.985	2026-02-24 12:46:40.985
7233e586-fead-4333-a009-3a1019bc4b02	4a91ecdc-027a-4a2f-b6d1-7c66fd4f16f8	10	3708.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:00:26.11	2026-02-24 13:00:26.11
c3716bd2-1f7a-4a48-bc46-44e3c2caf6d5	0de8b8b2-71ce-434e-a1ae-9406ed935ba1	3	29000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:03:33.723	2026-02-24 13:03:33.723
3a8c2145-a8ce-474f-b897-4375b3a0afd3	ccd0d38b-205f-42ae-a15a-5a47a85bd761	2	23000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:04:29.122	2026-02-24 13:04:29.122
7381444d-26a5-4a30-bdbc-8be5bf6dc01d	963c39c1-49f8-4d2f-b51a-9768488cd9f8	2	28000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:05:30.069	2026-02-24 13:05:30.069
3ede5514-b119-4ec0-89ab-0a54066b522f	7513ef89-ae41-4690-9b84-f3c129f2c53b	5	42211.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:06:32.958	2026-02-24 13:06:32.958
090e31cb-02cc-4fc9-9185-00165bf42bca	1af0e2f0-088a-456f-a301-137ffba4c2df	3	46000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:08:15.348	2026-02-24 13:08:15.348
a319412b-cd3c-4990-8b2e-18009c7d5741	3be89360-dfc6-43c2-9b0d-33051f8359cf	2	75000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:09:17.087	2026-02-24 13:09:17.087
d8e21e0b-e4d0-4c56-b412-12725ee55123	6368f3a1-774d-40d3-bb38-914288e12a51	1	98500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:10:17.728	2026-02-24 13:10:17.728
bc74e816-522d-4d5b-8f30-9b7f74d7d8d0	9defd86f-a91f-4076-8b76-749cec81f596	3	34500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:11:36.675	2026-02-24 13:11:36.675
bd644797-5314-4753-98ef-29ff7487c48b	bbb3eaa7-ccb3-4fe8-9041-61e5af904083	2	109250.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:13:01.334	2026-02-24 13:13:01.334
9fe37f1f-b813-4953-bac5-16dc286514ae	7547da4d-43b8-487b-97b5-002630eb5d25	2	74750.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:14:34.329	2026-02-24 13:14:34.329
53c6b432-7dda-4871-a9a1-3a31be7f4817	53041288-2568-48ec-a288-68cb67f10e3d	1	6325.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:15:45.858	2026-02-24 13:15:45.858
4895b075-ebb2-4f84-aca5-7a6e3b924fb8	851f6621-566f-44cb-ae85-b2faf1a8458f	2	10925.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:16:52.471	2026-02-24 13:16:52.471
574fa7d1-f8b4-4cf2-a81b-06baf39b09fb	e5bdbbd2-3122-4730-8c98-1a7f6cbc2502	1	29900.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:19:12.864	2026-02-24 13:19:12.864
394bd565-488d-4dab-a064-2ae1935da470	f99ff96a-c841-418c-9810-75ab204f031c	5	800.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:20:12.359	2026-02-24 13:20:12.359
a8908295-a8df-4b58-af5b-0c180fa447eb	04cba6e9-70d1-4192-947d-db2e6bbfaf82	2	135000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:21:20.443	2026-02-24 13:21:20.443
efc6c4c7-d77f-4651-bb98-3798821f1df9	e4d9483a-2418-4e4d-8392-1d1f06d69244	2	63000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:27:21.25	2026-02-24 13:27:21.25
3487b120-a9b0-476d-9202-f63002831658	a48f9fab-91ad-4b15-8f36-815a945425e1	3	12500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:28:21.103	2026-02-24 13:28:21.103
fc57e9ee-d3b2-4365-b990-f72c35210b64	219df1d4-022c-4118-889d-54064190ce60	4	4800.00	\N	\N	Abdulkerim	FULLY_PAID	0.00	\N	2026-02-24 13:30:29.284	2026-02-24 13:30:29.284
3a6fe67f-b0e9-45fb-bb29-51722e84006b	371f5fc4-d402-4d93-a852-9238e2435645	1	120000.00	\N	\N	Snap Trading	FULLY_PAID	0.00	\N	2026-02-24 13:31:37.277	2026-02-24 13:31:37.277
02469020-ab13-4a71-8cb6-e438a72b4ece	6964464b-2212-4406-92bb-098b11b7fc60	10	760.00	\N	\N	Tigistu Stationary	FULLY_PAID	0.00	\N	2026-02-24 13:33:45.447	2026-02-24 13:33:45.447
77f21b02-0ca2-4177-a41d-37f368397a2d	79fd5058-7547-4044-92ec-a49daa54dfd7	2	600.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:34:41.278	2026-02-24 13:34:41.278
463fcde4-e61e-47dd-90f6-d1c67bf4c9dc	c845590d-4fc5-4f05-b233-995fc1036e06	3	1200.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:36:40.795	2026-02-24 13:36:40.795
4d10610a-0fc4-44e9-98d7-5f09c4322594	2d7855b4-8796-4546-b3cc-374d25d59769	10	1000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:37:23.568	2026-02-24 13:37:23.568
c13cc479-7511-4b2f-b060-d1626157457e	b54e1d8e-a389-4aef-a6a8-19aa2280c598	10	8700.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:38:21.852	2026-02-24 13:38:21.852
237d770f-1571-45ff-80a6-eabaee38b5bb	beea1235-2a6e-4a24-86b7-12968ddfd40e	2	21000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:39:14.466	2026-02-24 13:39:14.466
2fa3e5eb-55db-4374-81e1-50001032a77d	6b277386-3b71-41ce-b732-0cd7d2eafb62	10	1100.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:40:56.428	2026-02-24 13:40:56.428
6c7c1716-6a48-4b95-9e7f-a5c61b4ccd75	6ae5e16b-d448-47f6-a28e-9bca25bd9b19	10	1100.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:41:48.252	2026-02-24 13:41:48.252
31770c3a-b063-412a-a134-cd3787ba2e73	3f915754-d14f-4bf2-8593-87031c761d1b	10	650.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:42:48.696	2026-02-24 13:42:48.696
61b59149-8cdc-4317-ac9e-c41c726f4cb3	4fd66a8b-54a1-438c-bc75-1bea21825857	6	700.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:44:08.561	2026-02-24 13:44:08.561
533c529a-8c06-4f93-b0d0-edb25cdb32cb	4a7ded25-8979-44f4-b175-2123438ccbea	1	14500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:53:34.684	2026-02-24 13:53:34.684
cc1350fa-40cb-4872-bfdf-22b25da979b1	37d64b37-9426-4f69-b049-ff8ea08309ba	6	15500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:57:11.749	2026-02-24 13:57:11.749
c1552215-2608-4571-a63f-6270a14ae703	629ef940-1686-423e-a056-b71ebdb5b41d	3	14500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 13:59:47.924	2026-02-24 13:59:47.924
b28b4498-ec60-46e2-9177-d216e0634fa0	dc2516de-85b3-431e-9936-1a6f49376ca1	2	37450.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:02:09.047	2026-02-24 14:02:09.047
67d58696-af4f-4b9c-b314-8cd2fbe7b103	7e0e9561-84ea-47c8-a9e8-86b7656aa99e	2	26900.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:04:19.275	2026-02-24 14:04:19.275
9b0cb7d0-bf61-489a-9a41-a0872ab8bf39	f5b9febd-59d9-4c86-a1a4-10f266b27809	2	49500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:07:36.012	2026-02-24 14:07:36.012
e32d6cbc-e387-481f-93da-344eb760592d	3aa0ddbb-af20-45c2-bf3f-31832f1065b3	6	7400.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:10:12.184	2026-02-24 14:10:12.184
841a72ca-ba02-4d26-8cec-f219e52e2e4a	e005f819-e598-4435-83c6-5ea8b084b0b5	6	7400.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:10:37.851	2026-02-24 14:10:37.851
4098a1c7-31f6-4745-9ab0-9ae300a3b0f5	b2be0ef3-45f6-476b-ba97-8b1feee18955	6	7400.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:11:08.165	2026-02-24 14:11:08.165
5083b7c9-1f1a-4f29-9bb5-3c58ab2312cf	6964e1ab-68f2-46d6-bee7-c15cf6e3e463	6	7400.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:12:12.121	2026-02-24 14:12:12.121
2ebd594e-a68a-4dc9-af9f-a8a6bd332b94	1d29ecf0-7c00-4864-a733-d4dbd2899859	10	5000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:15:25.782	2026-02-24 14:15:25.782
990e0743-2f5b-43fe-95b1-5b3c137ae2a3	6640dd48-1e9d-4f8c-9b38-2ec1820d5f9d	2	29500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:17:54.383	2026-02-24 14:17:54.383
e858f04f-3090-4655-86cd-80fef3a430f5	1f70fbbe-e27a-45e3-a7a3-2574e3670efa	2	29500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:18:14.581	2026-02-24 14:18:14.581
655b4a0e-24b9-4efa-9f07-0c0bec8f5ce4	2ede1204-2cf8-461b-9a8f-c2f803e01ed0	2	29500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:18:47.947	2026-02-24 14:18:47.947
2a3beb4f-5ac5-41bd-8d0e-80feb2079afb	fe9b0349-ee6c-466c-a99c-48710e5a1c8a	2	29500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:19:30.275	2026-02-24 14:19:30.275
a0e6ce27-ab69-413a-8350-7f51caadfc98	d8fb7f53-913b-4f48-a9e6-caf67e65357d	2	29500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:19:31.303	2026-02-24 14:19:31.303
79a87270-61c0-4f0d-a289-04b2d2b50682	a07fe944-30ac-4a35-9548-156385af748d	2	29500.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:19:31.689	2026-02-24 14:19:31.689
02f1525a-cd88-4703-b717-6b026cef8bb8	90541cf9-c7f5-468e-8ebf-49a4f88fde3f	5	2185.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:26:51.942	2026-02-24 14:26:51.942
61123158-a290-4fef-8432-0a627c53aa7b	b9cd9b0a-a1fd-475b-8bb1-bb1d5026566b	5	2415.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:41:03.659	2026-02-24 14:41:03.659
8202901f-87e1-4edb-a1a8-1dd924e4ce63	412d98a7-b8a6-4fa8-b005-07fcab7a2f1b	5	2012.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:44:09.657	2026-02-24 14:44:09.657
2f696b26-d264-4d19-b8d7-b43724b8f105	9167412f-d10b-4c27-91a6-47f81d3510f5	5	2012.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-24 14:46:45.217	2026-02-24 14:46:45.217
3d132569-5219-44c1-b2af-c56da78b45f5	e0f4a0cd-3acc-414e-b430-62447c5bba2e	2	86000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:14:56.077	2026-02-27 11:14:56.077
cc3c3927-3c8d-479f-8e2d-2ac8b5620d85	bac83f44-8d13-4197-9cb7-298a52f4f424	5	1495.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:20:44.866	2026-02-27 11:20:44.866
e6619983-2fa6-4397-89ce-c1730bc5b5fe	e05eeb28-226b-4586-a974-709dc75637cc	5	550.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:23:39.958	2026-02-27 11:23:39.958
6d6ec4ba-f913-49c2-9f96-89518130c529	979c4522-47de-4271-b593-e82c09415902	5	172.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:27:05.135	2026-02-27 11:27:05.135
689ccb38-6a76-4240-a4ca-111d5110dc13	dc49704c-e69a-42c6-a835-b70c4aa59ee9	3	10925.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:29:40.864	2026-02-27 11:29:40.864
44508ab4-50d8-4904-8bdf-09df3b0218b9	516bb920-99b5-440b-9c42-5042d2765329	2	16100.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:31:32.038	2026-02-27 11:31:32.038
7de02213-94a4-4c46-867c-a1625c5355f6	bcbcc94f-e100-4e2d-a152-c9a9dbc5caa9	3	44000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:35:24.815	2026-02-27 11:35:24.815
5de70e6b-de75-4920-a7d3-5431a4658403	132edc70-d8a6-4137-9763-e53480643def	1	44000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:37:03.331	2026-02-27 11:37:03.331
2f81b2eb-62f8-4616-b31f-26157297fd7f	2d50b420-f8cc-47dd-b357-576c994cbe54	1	48000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:39:10.876	2026-02-27 11:39:10.876
41000171-d23a-4d1e-b125-4396d5875396	ed1d15c5-2a9b-4dec-a80a-e53486034e44	2	40000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:41:04.922	2026-02-27 11:41:04.922
06e5fee3-817a-4349-a270-1bdaa6884c55	2491ec53-8e0e-4420-98d5-0ec96b9af41e	1	48000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:42:47.639	2026-02-27 11:42:47.639
b3638902-3487-4907-851e-578627e5d9bf	59c89517-526f-4b46-9470-bded8bbb204d	1	44000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:44:50.113	2026-02-27 11:44:50.113
512d5596-25fa-43c8-a585-5c474ac34c67	921756f2-3498-42dd-b349-32f618c77a36	1	44000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:46:17.607	2026-02-27 11:46:17.607
c0d1166d-90e6-4933-8d10-bad6afb40bbd	df128990-f5f2-4cec-84d9-c9ba4aa88248	1	52000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:48:51.508	2026-02-27 11:48:51.508
6ad9e4e8-e9a3-40a2-836b-caff93fceb80	8c7881e1-c0b3-42d3-8507-3e2d177befd7	1	25000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:50:25.497	2026-02-27 11:50:25.497
d1d2c857-3d54-42a6-a1f0-81e73f4dd304	50186f98-33fe-4ae1-888b-a005d335d9bf	3	1725.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:52:55.965	2026-02-27 11:52:55.965
01572ba3-95dc-4f3e-8969-4feddfb530e2	32b3a657-8783-4f18-a9b6-47ecc865847f	2	7475.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:55:51.497	2026-02-27 11:55:51.497
3e6231b0-cfdb-4861-87a4-f8f75197b0fb	c1393fc3-3668-4ddc-8970-25f909a79e99	1	6900.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:57:06.191	2026-02-27 11:57:06.191
8950aa12-4940-4f72-aa38-742fdf6bb32d	9d46d3f3-3bca-4d9e-8e4a-fa209e5717ed	2	17000.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:58:18.125	2026-02-27 11:58:18.125
527e1c13-124e-4a3d-ae71-77b7650af85f	c6816746-5d55-4462-954b-7b8a7194f1be	1	32200.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 11:59:33.824	2026-02-27 11:59:33.824
3ae0389e-9d7f-427e-9bce-c191a2fa9627	95e7aa86-f56a-40c6-b205-ac741ef693b1	1	1840.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 12:01:49.435	2026-02-27 12:01:49.435
8fca1dec-0922-45c5-b1ae-217ee86f1f99	93c188d1-9785-4ce3-aee2-ced7d91d9a19	1	172.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 12:03:17.369	2026-02-27 12:03:17.369
329e5b11-3534-4b55-972e-1796c8e251f2	199f4de2-028a-429c-810e-2cb3608a8004	1	21850.00	\N	\N	N/A	FULLY_PAID	0.00	\N	2026-02-27 12:04:42.522	2026-02-27 12:04:42.522
\.


--
-- Data for Name: supplier_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_payments (id, stock_entry_ids, amount, method, supplier_name, notes, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, is_active, total_commission, created_at, updated_at) FROM stdin;
d8edcde5-4957-40b5-8e4c-ebb37f18c274	Admin User	admin@realbright.com	$2b$12$U5TWQJrzRxbpcr7gBl/XQOHP81Xtz6XHb.U8PHB/2pGI0TZNpLfM6	ADMIN	t	0.00	2025-12-30 13:24:23.379	2026-02-02 10:42:32.429
6db66daa-ed65-4017-9960-e8ad0a8eff11	admin@test.com	admin2@gmail.com	$2b$12$dT6VuZ10i/o/w0iG6d4h.OsNT60XIAtBPmhgiWm7p9UExswbk2eYi	ADMIN	f	0.00	2026-01-04 06:18:43.37	2026-02-23 13:40:42.012
715a1fe2-b8a7-4436-a6ec-064344eb1b1f	Mastewal solomon	mesti@gmail.com	$2b$12$OqHZizceIJC0r9L9RsLawuvHKLL3GnZ1FXOs7C6NWV8uGZoaM0aMK	SALES	t	0.00	2026-02-23 13:40:28.253	2026-02-23 13:47:38.302
7dca7be0-1460-46fa-b510-18b9d8323de0	bruke	bruk@gmail.com	$2b$12$UyiXuTkigXo.pBCj79R2z.Fw6hYbAXTnmMt6G1SxXgR2/wn9.LZ9W	SALES	t	0.00	2026-02-23 13:19:15.346	2026-02-23 13:47:40.428
6df92a47-912a-4b89-a47b-6086b5c1ebab	jone	jone@gmail.com	$2b$12$QEptPcXtCkDfMvHHxV6SB.9SIJn5r9tDT9WK/GbVattSiKgVwrTT2	SALES	f	0.00	2026-01-04 07:43:06.895	2026-02-23 14:18:50.908
d6818034-5f2c-4cb0-832e-e8bc5023badc	john	john@gmail.com	$2b$12$HJRoi2BaPvAHyOiw0PIGzuqo7xeXr/2TeFLouQ8qWfdszJLH7lIti	SALES	t	0.00	2026-02-23 13:18:44.85	2026-02-23 14:21:01.591
cb2dbe97-bafb-4056-be94-a902da94aa37	Ribka Sheno	ribka@gmail.com	$2b$12$lxHvG3PbCnZlJxQsdxG2SepzGLZxBGkrya/flLOUWUQdwLm1oQhWy	SALES	t	0.00	2026-02-03 06:08:39.213	2026-02-23 14:52:36.555
aeb4f2de-3876-42c0-a7fc-5e529d1f6006	Sales User	sales@test.com	$2b$12$Li10rV/kln/tPXqYjMe8TOmEaIZO8q.h1NE6zONA.O9y689cXV5RG	SALES	t	0.00	2025-12-30 13:24:22.921	2026-02-24 13:58:41.607
0d018226-e512-4067-b17d-7a6635652e88	Biruk	biruk@gmail.com	$2b$12$b.4rBOeG0EN/lE/viO4C6.gtaZ5avHy40RmI.sySvzb2gA2RvlFV2	SALES	t	0.00	2026-01-04 08:25:33.995	2026-02-27 08:09:58.851
a870951e-bdcf-4bb8-969f-13951c99daeb	sales	sales@realbright.com	$2b$12$ks4.bKJ0feMkd8WGs5KjweTMnrmbYpmzYwfJy0qjhr/EA4ckDrfkK	SALES	t	0.00	2026-01-04 06:23:11.361	2026-02-27 08:37:23.106
a7db893e-3fcb-40e7-afa8-02d0a0bf6561	sales@realbright.com	sales2@gmail.com	$2b$12$Ek6QW1rop47OqnVMiq818e3keH7klh7IUeAnjkvrDiQVOqrglI0Q.	SALES	t	0.00	2026-01-04 06:18:06.884	2026-02-27 08:39:36.558
\.


--
-- Data for Name: website_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.website_settings (id, key, value, description, updated_at, updated_by) FROM stdin;
\.


--
-- Name: _StockEntryToSupplierPayment _StockEntryToSupplierPayment_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_StockEntryToSupplierPayment"
    ADD CONSTRAINT "_StockEntryToSupplierPayment_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: daily_opening_balances daily_opening_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_opening_balances
    ADD CONSTRAINT daily_opening_balances_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: payments_received payments_received_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_received
    ADD CONSTRAINT payments_received_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: public_products public_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.public_products
    ADD CONSTRAINT public_products_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_entries stock_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_entries
    ADD CONSTRAINT stock_entries_pkey PRIMARY KEY (id);


--
-- Name: supplier_payments supplier_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT supplier_payments_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: website_settings website_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.website_settings
    ADD CONSTRAINT website_settings_pkey PRIMARY KEY (id);


--
-- Name: _StockEntryToSupplierPayment_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_StockEntryToSupplierPayment_B_index" ON public."_StockEntryToSupplierPayment" USING btree ("B");


--
-- Name: daily_opening_balances_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX daily_opening_balances_date_key ON public.daily_opening_balances USING btree (date);


--
-- Name: products_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_code_key ON public.products USING btree (code);


--
-- Name: sales_invoice_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sales_invoice_number_key ON public.sales USING btree (invoice_number);


--
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: website_settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX website_settings_key_key ON public.website_settings USING btree (key);


--
-- Name: _StockEntryToSupplierPayment _StockEntryToSupplierPayment_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_StockEntryToSupplierPayment"
    ADD CONSTRAINT "_StockEntryToSupplierPayment_A_fkey" FOREIGN KEY ("A") REFERENCES public.stock_entries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _StockEntryToSupplierPayment _StockEntryToSupplierPayment_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_StockEntryToSupplierPayment"
    ADD CONSTRAINT "_StockEntryToSupplierPayment_B_fkey" FOREIGN KEY ("B") REFERENCES public.supplier_payments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contacts contacts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: daily_opening_balances daily_opening_balances_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_opening_balances
    ADD CONSTRAINT daily_opening_balances_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments_received payments_received_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_received
    ADD CONSTRAINT payments_received_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments_received payments_received_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_received
    ADD CONSTRAINT payments_received_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments_received payments_received_salesperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments_received
    ADD CONSTRAINT payments_received_salesperson_id_fkey FOREIGN KEY (salesperson_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sale_items sale_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales sales_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales sales_salesperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_salesperson_id_fkey FOREIGN KEY (salesperson_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_adjustments stock_adjustments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_adjustments stock_adjustments_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_entries stock_entries_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_entries
    ADD CONSTRAINT stock_entries_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict hX8sOPXZPQJo2hGnUdgYl5HMUv6fc1KvFyX8bqpOvLneoLKwXi2FqIBrVu2fa50

