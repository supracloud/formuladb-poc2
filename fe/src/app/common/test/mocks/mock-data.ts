/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { Entity } from '../../domain/metadata/entity';


const Act_AdminFredrick = { _id: "General___Actor~~10", fisrtName: "Fredrick", lastName: "Lehner", code: "act10", username: "Fredrick51", email: "Fredrick_Lehner93@yahoo.com", avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/nilshoenson/128.jpg", name: "Fredrick Lehner", role: "USER", password: "FDvK1pIc9czWhpK", details: "International Operations Liaison", state: "ACTIVE_" };
const Act_OperatorKeenan = { _id: "General___Actor~~1", fisrtName: "Keenan", lastName: "Leffler", code: "act1", username: "Keenan_Leffler75", email: "Keenan_Leffler@hotmail.com", avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/silv3rgvn/128.jpg", name: "Keenan Leffler", role: "USER", password: "m6hcItQliiryThP", details: "Legacy Group Liaison", state: "ACTIVE_" };
const Act_OperatorJoannie = { _id: "General___Actor~~2", fisrtName: "Edwardo", lastName: "McKenzie", code: "act2", username: "Edwardo45", email: "Edwardo_McKenzie91@gmail.com", avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/scott_riley/128.jpg", name: "Edwardo McKenzie", role: "USER", password: "nOyF9AvZt6oQ8z6", details: "Forward Factors Strategist", state: "ACTIVE_" };
const Act_AgentJerrod = { _id: "General___Actor~~4", fisrtName: "Jerrod", lastName: "Dibbert", code: "act4", username: "Jerrod.Dibbert18", email: "Jerrod72@yahoo.com", avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/psaikali/128.jpg", name: "Jerrod Dibbert", role: "USER", password: "QbDB6Z5tORtehtp", details: "Corporate Directives Developer", state: "ACTIVE_" };
const Act_AgentCristal = { _id: "General___Actor~~7", fisrtName: "Cristal", lastName: "Balistreri", code: "act7", username: "Cristal.Balistreri85", email: "Cristal.Balistreri81@hotmail.com", avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/guillemboti/128.jpg", name: "Cristal Balistreri", role: "USER", password: "I0gSoWkscG77aWq", details: "Lead Markets Officer", state: "ACTIVE_" };
const Act_Johns = {  _id: "General___Actor~~1",  firstName: "Rhianna",  lastName: "Johns", code: "act112",  username: "Rhianna.Johns80",  email: "Rhianna51@hotmail.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/mattsapii/128.jpg",  name: "Rhianna Johns",  role: "USER",  password: "GsR0ecA0QCb4BNt",  details: "Investor Branding Administrator",  state: "ACTIVE_" };
const Act_Simonis = {  _id: "General___Actor~~2",  firstName: "Monserrat",  lastName: "Simonis", code: "act113",  username: "Monserrat_Simonis97",  email: "Monserrat_Simonis@yahoo.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/adamawesomeface/128.jpg",  name: "Monserrat Simonis",  role: "USER",  password: "53kPQyvovAyIBmP",  details: "Dynamic Integration Analyst",  state: "ACTIVE_" };
const Act_Stracke = {  _id: "General___Actor~~3",  firstName: "Vergie",  lastName: "Stracke", code: "act114",  username: "Vergie.Stracke15",  email: "Vergie_Stracke17@yahoo.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/psaikali/128.jpg",  name: "Vergie Stracke Sr.",  role: "USER",  password: "FaBnBArCGdVwb6F",  details: "Dynamic Markets Architect",  state: "ACTIVE_" };
const Act_Wolf = {  _id: "General___Actor~~4",  firstName: "Keyon",  lastName: "Wolf", code: "act115",  username: "Keyon_Wolf",  email: "Keyon84@gmail.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/jesseddy/128.jpg",  name: "Keyon Wolf",  role: "USER",  password: "voACnXq3UzbcfpU",  details: "District Infrastructure Planner",  state: "ACTIVE_" };
const Act_Buckridge = {  _id: "General___Actor~~5",  firstName: "Jerad",  lastName: "Buckridge", code: "act116",  username: "Jerad_Buckridge",  email: "Jerad_Buckridge68@hotmail.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/conspirator/128.jpg",  name: "Jerad Buckridge",  role: "USER",  password: "w90xvIFveBIa5US",  details: "International Intranet Consultant",  state: "ACTIVE_" };
const Act_Conn = {  _id: "General___Actor~~6",  firstName: "Ottis",  lastName: "Conn", code: "act117",  username: "Ottis74",  email: "Ottis33@gmail.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/funwatercat/128.jpg",  name: "Ottis Conn",  role: "USER",  password: "gEbxCYKrkQic4_U",  details: "Future Program Executive",  state: "ACTIVE_" };
const Act_MacGyver = {  _id: "General___Actor~~7",  firstName: "Hobart",  lastName: "MacGyver", code: "act118",  username: "Hobart.MacGyver",  email: "Hobart_MacGyver38@gmail.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/thimo_cz/128.jpg",  name: "Hobart MacGyver",  role: "USER",  password: "9WgirNxzQpLX17B",  details: "Regional Interactions Orchestrator",  state: "ACTIVE_" };
const Act_Ondricka = {  _id: "General___Actor~~8",  firstName: "Brandon",  lastName: "Ondricka", code: "act119",  username: "Brandon51",  email: "Brandon.Ondricka49@gmail.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/lebinoclard/128.jpg",  name: "Brandon Ondricka Jr.",  role: "USER",  password: "3CPVxn01tz0u3hE",  details: "Legacy Metrics Planner",  state: "ACTIVE_" };
const Act_Collins = {  _id: "General___Actor~~9",  firstName: "Bonita",  lastName: "Collins", code: "act120",  username: "Bonita33",  email: "Bonita_Collins@yahoo.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/michaelbrooksjr/128.jpg",  name: "Bonita Collins",  role: "USER",  password: "L53a4bvrs1rMU7m",  details: "Central Identity Analyst",  state: "ACTIVE_" };
const Act_Wiza = {  _id: "General___Actor~~10",  firstName: "Lonie",  lastName: "Wiza", code: "act121",  username: "Lonie_Wiza",  email: "Lonie_Wiza50@gmail.com",  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/loganjlambert/128.jpg",  name: "Lonie Wiza",  role: "USER",  password: "s_0tPHr0hBUBVLD",  details: "Customer Division Coordinator",  state: "ACTIVE_" };

const Cur_RON = { _id: "General___Currency~~1", code: "RON", rate1: 1, rate2: 1, rate3: 1, rate4: 1, rate5: 1 };
const Cur_EUR = { _id: "General___Currency~~2", code: "EUR", rate1: 101, rate2: 102, rate3: 103, rate4: 104, rate5: 105 };
const Cur_USD = { _id: "General___Currency~~3", code: "USD", rate1: 101, rate2: 102, rate3: 103, rate4: 104, rate5: 105 };

const Cln_Ratke = {  _id: "General___Client~~1",  name: "Ratke Inc",  email: "Sheldon.Barton2@yahoo.com",  bs: "world-class benchmark e-business",  catchPhrase: "Virtual high-level function" };
const Cln_Gibson = {  _id: "General___Client~~2",  name: "Gibson Group",  email: "Laverna.Von21@yahoo.com",  bs: "e-business innovate infomediaries",  catchPhrase: "Switchable fresh-thinking synergy" };
const Cln_Koelpin = {  _id: "General___Client~~3",  name: "Koelpin, Zulauf and Kerluke",  email: "Kory_Bruen85@gmail.com",  bs: "B2C disintermediate ROI",  catchPhrase: "Public-key uniform circuit" };
const Cln_Crist = {  _id: "General___Client~~4",  name: "Crist Group",  email: "Nya83@hotmail.com",  bs: "cutting-edge transform architectures",  catchPhrase: "Profound exuding architecture" };
const Cln_Ledner = {  _id: "General___Client~~5",  name: "Ledner, Dickinson and O'Reilly",  email: "Kenyon.Romaguera7@yahoo.com",  bs: "rich target applications",  catchPhrase: "Customizable bottom-line function" };
const Cln_Pagac = {  _id: "General___Client~~6",  name: "Pagac Inc",  email: "Rene.Terry25@hotmail.com",  bs: "best-of-breed enable users",  catchPhrase: "Advanced attitude-oriented website" };
const Cln_Toy = {  _id: "General___Client~~7",  name: "Toy, Mayer and Sawayn",  email: "Margaret.Wyman@gmail.com",  bs: "bricks-and-clicks reintermediate vortals",  catchPhrase: "Assimilated national conglomeration" };
const Cln_Kirlin = {  _id: "General___Client~~8",  name: "Kirlin LLC",  email: "Mireya_Beer35@hotmail.com",  bs: "web-enabled cultivate infrastructures",  catchPhrase: "Reverse-engineered mobile budgetary management" };
const Cln_Buckridge = {  _id: "General___Client~~9",  name: "Buckridge - Windler",  email: "Joshuah_Kautzer95@gmail.com",  bs: "B2B whiteboard synergies",  catchPhrase: "Operative local project" };
const Cln_Cummerata = {  _id: "General___Client~~10",  name: "Cummerata - Kohler",  email: "Hugh.Beahan98@gmail.com",  bs: "cross-platform monetize users",  catchPhrase: "Right-sized regional collaboration" };

const Prd_1 = { _id: "Inventory___Product~~1", code: "p1", barcode: "40063813339310", name: "Product1", description: "Product 1 Description lorem ipsum bla bla" };
const Prd_1a = { _id:"Inventory___Product~~1a", code:"p1a", barcode:"4006381333931", name:"Practical Concrete Car",  category:"Shoes", subcategory:"asperiores", description:"Quas reiciendis non et eveniet iure aut.", longDescription:"Doloribus recusandae fuga ea magnam. Magnam unde culpa sed voluptates alias veniam quis ea provident. Qui ad rerum laborum quas eum quisquam.\n \rIpsam voluptates quaerat molestias. Aperiam eos explicabo voluptate id est molestias iusto. Aliquam dolores sit quo quia. Nobis doloremque aut neque. Enim et sit nobis minima est ipsa ut mollitia. Odio aut nemo dolorum repellat occaecati possimus quia saepe consequuntur.\n \rVoluptas nisi qui dolore commodi quis fugiat fuga. Ipsam qui quasi ad. Sapiente repellendus quidem qui dolorum. Asperiores vel velit repellat aut voluptate excepturi. Doloribus quia accusamus qui hic blanditiis. Totam et reprehenderit autem sequi eveniet quas sapiente et dolores."};
const Prd_2a = { _id:"Inventory___Product~~2a", code:"p2a", barcode:"4006381333932", name:"Gorgeous Cotton Table",  category:"Toys", subcategory:"quas", description:"Libero voluptatem aut.", longDescription:"Velit saepe nam aspernatur ut expedita. Delectus accusantium ut non voluptate dolorem asperiores fuga ipsa. Ut animi tempora sed nihil et. Id voluptatum aut soluta suscipit. Qui ut illo et. Soluta adipisci sint.\n \rEst rerum vel est facilis dolorum ut. Provident corrupti doloremque et. Nihil culpa et rem libero. Beatae iste quidem et nulla asperiores atque voluptatem.\n \rUt temporibus incidunt. Unde dignissimos impedit eligendi veritatis hic et dolores. Tempore animi velit repudiandae beatae vero."};
const Prd_3a = { _id:"Inventory___Product~~3a", code:"p3a", barcode:"4006381333933", name:"Fantastic Frozen Pizza",  category:"Movies", subcategory:"commodi", description:"Aut culpa iusto harum ad.", longDescription:"Earum dolore hic fugit ad delectus reprehenderit consequatur inventore. Dolore autem dolor cum et ipsa facilis. Eius eligendi incidunt et sapiente et laborum tempora. Et blanditiis quo praesentium mollitia inventore qui.\n \rEos iure voluptate distinctio sed dolor. Id asperiores ut unde illum modi velit non. Sit dolorem velit. Sed soluta velit. Accusantium et aliquam.\n \rAutem praesentium aspernatur reprehenderit praesentium sed. Perspiciatis architecto quia non neque. Sint repellat omnis enim officia est rerum. Similique quia fugiat odio cumque accusantium dolor. Molestiae animi impedit voluptate maiores ipsam rem excepturi sed. Pariatur dolorem voluptatem non est enim assumenda impedit."};
const Prd_4a = { _id:"Inventory___Product~~4a", code:"p4a", barcode:"4006381333934", name:"Awesome Granite Pants",  category:"Tools", subcategory:"amet", description:"Assumenda nostrum quaerat fugit nesciunt libero aliquam.", longDescription:"Quia minus veritatis quidem autem et sed qui qui. Aut qui repellendus aut et ipsum porro. Illo vel optio quisquam voluptatibus vel enim qui sint et. Doloribus quis ea reprehenderit aliquam deleniti rem nesciunt temporibus sequi.\n \rMinima cum minima sed consequatur deleniti voluptate dolor vero. Cupiditate quibusdam voluptatibus eum et distinctio laudantium numquam. Facere maxime ut accusantium est id culpa. Reprehenderit maiores at. Et laboriosam explicabo ab sed tempore exercitationem enim perspiciatis. Corrupti omnis cum qui nostrum.\n \rDignissimos corporis molestiae velit qui. Ea dolores ea fugit facilis atque blanditiis praesentium aut. Iure rem aliquam."};
const Prd_5a = { _id:"Inventory___Product~~5a", code:"p5a", barcode:"4006381333935", name:"Awesome Steel Car",  category:"Beauty", subcategory:"molestias", description:"Architecto cum maiores velit voluptatibus.", longDescription:"Soluta voluptates et enim dolor. Enim amet voluptas vitae nobis velit quia reprehenderit aut sed. Exercitationem dolores dignissimos natus doloribus harum.\n \rEst doloribuspossimus expedita distinctio blanditiis ipsam aspernatur velit quisquam. Et quia et itaque molestiae omnis. Minus eius odio.\n \rTemporibus qui minus quis velit. Distinctio nesciunt fugiat blanditiis sed et minus. Id architecto delectus quis hic. Incidunt vero et molestiae illum rerum totam. Molestiae tempora nesciunt enim nam hic repellat qui enim."};
const Prd_6a = { _id:"Inventory___Product~~6a", code:"p6a", barcode:"4006381333936", name:"Gorgeous Soft Shirt",  category:"Sports", subcategory:"ad", description:"Omnis omnis exercitationem eos nesciunt.", longDescription:"Sint non eligendi rem et quam eum repellat molestiae. Eveniet ut et rerum consequatur amet modi. Et ipsum sit. Soluta sit debitis nam ipsa necessitatibus. Ut doloremque sed. Modi saepe ut voluptatem explicabo est.\n \rMaxime asperiores in rem aut eius. Vitae sit ipsa totam. Voluptatem eum incidunt autem. Magnam culpa esse doloribus.\n \rCorrupti qui laborum rerum sunt laudantium. Accusantium aut sapiente aut magnam repudiandae autem occaecati rerum omnis. Quibusdam cumque maiores et dolor nihil possimus. Suscipit eum sed aut. Debitis recusandae pariatur praesentium perspiciatis quod exercitationem."};
const Prd_7a = { _id:"Inventory___Product~~7a", code:"p7a", barcode:"4006381333937", name:"Ergonomic Wooden Salad",  category:"Garden", subcategory:"repellat", description:"Ea maxime minima nostrum porro recusandae repellendus.", longDescription:"Soluta ut ipsa ut. Ratione sit ipsa quae tempora ipsam. Odit velit laboriosam alias. Veniam similique dolorem quia voluptatibus libero quasi maxime modi veniam. Enim illum aspernatur aut repellat ducimus voluptatem rerum. Quibusdam autem nihil et inventore.\n \rPerspiciatis nobis facilis. Placeat omnis minus et nisi dignissimos qui quia eum esse. Dolorumrecusandae adipisci. Eligendi quia aut autem. Eligendi commodi ipsa quis earum consequatur. Tempora officiis molestiae vel et.\n \rAut ratione dolore et itaque repellendus perspiciatis vero. Nisi aut ut quos dignissimos nihil qui veniam laboriosam. Facilis debitis explicabo sapiente commodi. Eos consequatur necessitatibus ut. Sed dolor aut rerum aut culpa veniam. Laborum ipsam sitmagnam ex quod voluptatem vel."};
const Prd_8a = { _id:"Inventory___Product~~8a", code:"p8a", barcode:"4006381333938", name:"Intelligent Fresh Tuna",  category:"Electronics", subcategory:"unde", description:"Architecto sed vitae molestias et minus nemorem provident.", longDescription:"Maiores asperiores ab velit dignissimos repudiandae modi dignissimos doloribus error. Voluptates odit saepe architecto labore dolorem cum. Quae fugiat doloribus nihil quod. Ducimus tempore qui sit. Dolorum itaque qui dolores occaecati dolorem ipsum et.\n \rConsectetur rerum totam et. Sed a est aut voluptates cum enim velit. Necessitatibus minus odio fugit vel reiciendis blanditiis officia. Omnis excepturi aspernatur voluptate deleniti eligendi ut optio.\n \rUt nihil aut quod velit quibusdam consequatur. Neque omnis mollitia et culpa inventore id ratione. Nam qui vel omnis inventore in sapiente quisquam."};
const Prd_9a = { _id:"Inventory___Product~~9a", code:"p9a", barcode:"4006381333939", name:"Handmade Frozen Hat",  category:"Kids", subcategory:"provident", description:"Fugit recusandae est illum voluptas officiis.", longDescription:"Ut officia ipsum fuga. Consectetur a adipisci natus quos dignissimos eos molestiae. Eos harum fugit dicta. Ex et est vel voluptatem cumque. Rerum facere dolore iste debitis tenetur commodi id eos neque.\n \rQuo nisi impedit quis inventore sunt. Omnis placeat mollitia voluptas. Consequatur et nulla. Ipsum possimus quidem incidunt enim laborum voluptas.\n \rQuod autad architecto et minima aliquid ipsa est laboriosam. Veritatis aut sequi rem dolorem sit. Dolorum autem quas unde."};
const Prd_10 = { _id:"Inventory___Product~~10", code:"p10", barcode:"40063813339310", name:"Incredible Rubber Computer",  category:"Automotive", subcategory:"nihil", description:"Reiciendis libero aut omnis ipsam veniam quas reiciendis.", longDescription:"Et non vero impedit voluptatem omnis. Molestiae est assumenda laboriosam. Eos est perspiciatis qui consequuntur expedita. Ducimus aut dignissimos id libero nisi est vel velit consequuntur. Dolores nihil asperiores qui.\n \rEt velit et commodi qui ex quis magnam aut. Impedit omnis sed quaerat quo. Amet omnis id ipsam dolorem sed.\n \rConsequuntur nisi enim et eos in dicta. Suscipit aut repudiandae sapiente autem quas commodi. Sequi commodi magnam nesciunt ea labore ut non optio. Perspiciatis odio ex natus beatae et culpa. Consequatur molestiae eaque aut inventore et repellat sint."};
const Prd_11 = { _id:"Inventory___Product~~11", code:"p11", barcode:"40063813339311", name:"Small Fresh Pants",  category:"Industrial", subcategory:"ipsam", description:"Temporibus quia perspiciatis sint exercitationem minima.", longDescription:"Quisquam et expedita impedit consequatur saepe repellendus sunt sit. Non molestiae veritatis eum excepturi ea quod. Consequatur hic reprehenderit. In non debitis vero velit earum nihil in. Et consequatur assumenda et. Cupiditate adipisci eum.\n \rIste vero neque veniam. Hic dolor quam sint architecto autem atque facere esse. Dolorem qui inventore autem. Totam quo ipsum reprehenderit et eligendi voluptates. Asperiores sapiente nam consequatur quidem quaerat saepe nulla. At eum dignissimos nemo et sed tenetur qui aut iusto.\n \rQuia provident facilis corrupti amet vero quam. Omnis mollitia et aut natus temporibus eaque quisquam commodi vel. Tenetur sunt consequatur et. Iure voluptatibus ea tempora odit quidem iure eum. Molestias accusantium natus possimus. Consequatur accusantium ipsum id."};
const Prd_12 = { _id:"Inventory___Product~~12", code:"p12", barcode:"40063813339312", name:"Unbranded Rubber Pizza",  category:"Games", subcategory:"reiciendis", description:"Eveniet itaque consequatur nostrum molestiae distinctio non quod.", longDescription:"Culpa libero voluptatem molestiae. Amet quia ut ut minus sed voluptate impedit voluptatem in. Voluptates eaque harum voluptatum sequi iure et et.\n \rVel itaque cupiditate assumenda incidunt qui. Reiciendis totam qui natus aut consequatur autem qui. Vitae ullam labore. Quam qui ipsam et voluptas velit est rerum culpa. Beatae sit voluptatum nihil dolorem repellendus consequatur. Iste nemo explicabo assumenda.\n \rId quia qui dignissimos explicabo est sunt libero. Aspernatur sit consectetur iure totam praesentium ipsam eligendi.Alias autem omnis placeat dolor beatae aperiam. Quia praesentium consectetur praesentium. Dicta voluptates officiis soluta nemo similique."};
const Prd_13 = { _id:"Inventory___Product~~13", code:"p13", barcode:"40063813339313", name:"Sleek Soft Mouse",  category:"Industrial", subcategory:"quaerat", description:"Voluptas quia aut iusto deleniti.", longDescription:"Perferendis rerum dolorem a. Commodi ut unde qui quia ipsum odit itaque facere praesentium. Ipsa dolore at qui alias. Voluptatem dignissimos nihil et dolor et sit dolorum quas esse. Iste tempore ratione eum in dolores beatae et veniam. Natus asperiores placeat fuga occaecati.\n \rCumque necessitatibus magnam. Fugit minus nulla hic dicta ducimus repudiandae temporibus ab in. Sed ad consequatur fuga autem laborum asperiores numquam enim. Rerum hic quos et qui consectetur. Qui et sint officia ut. Modi eligendi animi adipisci ratione aut in.\n \rQuos vitae officia dolores est facere sed temporibus ab dolores. Accusamus consequuntur esse deleniti voluptatem ut architecto asperiores quia aut. Corrupti error molestias eos delectus distinctio. Sunt nonassumenda. Aperiam ut vel dolore esse tempore rerum aperiam vitae corporis. Dignissimos tempore neque facere distinctio soluta quo."};
const Prd_14 = { _id:"Inventory___Product~~14", code:"p14", barcode:"40063813339314", name:"Licensed Cotton Chicken",  category:"Computers", subcategory:"molestiae", description:"Qui temporibus facere rem ut ullam excepturi non.", longDescription:"Sequi doloribus cupiditate omnis dolorum beatae. Ut unde perferendis architecto expedita eos et nihil sit. Molestiae et et.\n \rSint rerum explicabo deserunt ea voluptatem vero maiores. Dolor quod dolorem minus ea blanditiis maiores. Vel dolorem repellendus nemo eligendi minus reiciendis accusantium quis labore.\n \rBlanditiis ipsam nam esse dolor dolor nobis aut. Nostrum eos quasi id ipsam. Omnis recusandae labore assumenda facilis voluptatum fuga animi qui."};
const Prd_15 = { _id:"Inventory___Product~~15", code:"p15", barcode:"40063813339315", name:"Tasty Steel Fish",  category:"Electronics", subcategory:"quisquam", description:"Nemo vitae quam doloremque similique cum aspernatur.", longDescription:"Neque autem perferendis praesentium et. Ex nulla laborum similique. Cumque perferendis rerum tenetur nisi aut.\n \rVoluptatibus fuga voluptas velit. Rerum veritatis atque sint voluptate ab in sit quia. Dolores explicabo et aut sapiente dicta aliquid excepturi dolorum. Officia id sunt quia quibusdam qui voluptatum omnis incidunt blanditiis. Quia voluptate voluptatum maiores.\n \rOmnis sit voluptatem. Omnis velit aut molestiae. Enim tempora quibusdam sint aut est. Commodi nostrum quo deleniti sed. Officia repudiandae et et sit sunt id in. Quaerat alias molestiae et nobis aut dolor."};
const Prd_16 = { _id:"Inventory___Product~~16", code:"p16", barcode:"40063813339316", name:"Handcrafted Frozen Car",  category:"Toys", subcategory:"iusto", description:"Commodi numquam quisquam praesentium ducimus et dignissimos ut.", longDescription:"Quidem sit vel velit impedit illum quis voluptas ut. Quas quia neque dicta veritatis sunt doloribus. Similique ut rerum non perferendis. Assumenda voluptas quae cupiditate architecto non. Perspiciatis voluptatem vel ab earum quisquam.\n \rDolores facilis repellat reprehenderit. Vitae omnis magnam consequatur. Sint aut incidunt in reiciendis iure et rem.\n \rDolore earum minima. Et cumque neque voluptas sunt laboriosam autem enim deleniti error. Dolorem modi fugit provident unde nesciunt."};
const Prd_17 = { _id:"Inventory___Product~~17", code:"p17", barcode:"40063813339317", name:"Sleek Cotton Car",  category:"Shoes", subcategory:"assumenda", description:"Debitis qui eligendi eligendi sequi ipsam ea aut impedit.", longDescription:"Voluptatum unde necessitatibus distinctio debitis et vel quisquam et sed. Ea est deserunt. Dolor deleniti eaque tempora autem id omnis. Magnam et quia maiores fugiat non culpa pariatur saepe.\n \rEst esse vitae ducimus earum odit esse velit perspiciatis aliquid. Culpa dolorum vero recusandae est voluptas ut. Architecto amet aperiam. Reiciendis illo excepturi aperiam illum dolores odit aliquam repudiandae. Soluta optio ut voluptatibus. Et officiis esse ut impedit modi totam.\n \rUt adipisci enim nostrum eveniet qui. Tenetur adipisci dolorem quia sapiente voluptas. Ut tempora odit numquam impedit et. Consequatur aut quibusdam et. In quaerat sequi."};
const Prd_18 = { _id:"Inventory___Product~~18", code:"p18", barcode:"40063813339318", name:"Rustic Plastic Ball",  category:"Sports", subcategory:"ut", description:"Velit et consequuntur laboriosam asperiores sit illo neque dolores.", longDescription:"Harum iste et consequatur similique reiciendis adipisci vitae labore numquam. Dolorem expedita rerum eum alias rerum non nobis distinctio voluptates. Vel blanditiis consequatur voluptas ducimus quibusdam architecto. Voluptas voluptatem incidunt quia eos corrupti id sit. Placeat harum quos.\n \rPerferendis itaque aliquid saepe sit corrupti. Eveniet ut corporis nihil nostrum minus aut temporibus sint. Aliquid eveniet neque dolor voluptatem cum reprehenderit provident nesciunt. Velit tempore non harum aspernatur in soluta similique quia. Facere sint alias beatae rerum. Veritatis nemo consectetur.\n \rPerspiciatis assumenda molestias earum. Expedita voluptas et perferendis explicabo beatae officia commodi ea quia. Voluptatum error et ratione odio."};
const Prd_19 = { _id:"Inventory___Product~~19", code:"p19", barcode:"40063813339319", name:"Licensed Frozen Towels",  category:"Sports", subcategory:"ut", description:"Quo quae eum sed et nisi expedita architecto omnis iusto.", longDescription:"Tempore et atque et tenetur et velit reiciendis id cum. Voluptates mollitia esse omnis suscipit. Sit iure quia provident sit dolor adipisci. Numquam molestias consectetur. Dignissimos amet nulla magnam minus corporis iste sit iusto.\n \rQuis omnis molestias dolor aut vel. Nihil eius qui quo et tempora iste vitae id reprehenderit. Voluptatem quasi modi aut dignissimos excepturi aperiam earum alias voluptatem.\n \rVel voluptatem fugiat nesciunt eius illo expedita non. Dolores occaecati aut sapiente velit voluptatem porro natus. Quisquam quinihil velit tempora. Veritatis ad pariatur et. Nihil ut autem voluptas aut pariatur quasi eveniet quia dolorem. Quo iste id aut mollitia consequatur dolorum."};
const Prd_20 = { _id:"Inventory___Product~~20", code:"p20", barcode:"40063813339320", name:"Ergonomic Granite Car",  category:"Music", subcategory:"eum", description:"Animi at earum amet.", longDescription:"Et deleniti vero placeat magnam nam incidunt et asperiores. Exercitationem et aspernatur beatae esse nesciunt. Aut sit aperiam repellendus natus quia sunt debitis. Laboriosam laboriosam tenetur praesentium quisquam nobis voluptas. Sit sit veniam fugit odit autem dignissimos. Laboriosam est illo rerum quo in.\n \rPossimus sint perferendis velit ipsa. Recusandae earum et magnam modi. Aut sed architecto aut non. Corporis quas aperiam voluptatem voluptas suscipit.\n \rSit repellat voluptates et quisquam ut non similique. Delectus voluptatem numquam laboriosam. Beatae aspernatur veniam cum assumenda. Qui non hic quidem velit sit magni quasi. Sed temporibus incidunt. Quidem ut sint provident."};
const Prd_21 = { _id:"Inventory___Product~~21", code:"p21", barcode:"40063813339321", name:"Handmade Granite Pants",  category:"Clothing", subcategory:"nesciunt", description:"Molestias pariatur culpa voluptate sint et facilis sed.", longDescription:"Ipsum voluptas est neque magnam quam architecto aut nostrum. Exercitationem quos architecto libero voluptatem labore veritatis exercitationem pariatur. Voluptatem tempore consequatur non nam nihil quis assumenda qui. Provident voluptatem minus accusamus et voluptas. Quas nisi dicta.\n \rOmnis sunt aut ducimus dolores optio qui impedit nemo dolorum. Quos praesentium tempora porro voluptatem nihil ut ipsam totam autem. Aut quos officia non praesentium aliquid.\n \rMagnam ducimus error necessitatibus quia velit. Rerum natus nam repellendus.Quasi earum aperiam aspernatur blanditiis quod debitis. Sint est nulla eos qui autem dicta voluptatem omnis molestias. Voluptas laudantium inventore."};
const Prd_22 = { _id:"Inventory___Product~~22", code:"p22", barcode:"40063813339322", name:"Licensed Wooden Keyboard",  category:"Electronics", subcategory:"labore", description:"Aliquid ducimus est ut non vitae.", longDescription:"Quae occaecati in dolorem tenetur sint id fuga tempore minima. Est totam cum excepturi incidunt doloribus eligendi. Neque occaecati non rerum laudantium aut eum molestiae illo. Earum expedita exercitationem eum quia reprehenderit eius temporibus facilis labore. Similique cum et molestiae doloribus dolores. Iste dolor quibusdam assumenda explicabo nam est.\n \rAccusamusdeleniti est maiores commodi dicta consectetur eius. Neque nemo sed et aperiam velit ut voluptas quo at. Enim placeat et laboriosam ut saepe neque tenetur accusantium voluptatibus. Doloremqueab alias.\n \rUt aspernatur optio maxime aliquid veritatis voluptas voluptates. In voluptas fugiat. Odio cupiditate impedit explicabo perspiciatis aut pariatur. Vitae voluptates excepturi omnis rem ab odit quas sit. Nesciunt delectus quis ipsam temporibus consequatur hic."};
const Prd_23 = { _id:"Inventory___Product~~23", code:"p23", barcode:"40063813339323", name:"Fantastic Metal Shirt",  category:"Electronics", subcategory:"eius", description:"Sed dolorum pariatur accusamus.", longDescription:"Debitis ut illum nihil. Porro quisquam et quia aut similique reiciendis aliquid minus quis. Voluptatem rerum omnis alias. Ipsa fugiat aut et occaecati aut voluptates.\n \rVel optio autvoluptatem nobis non voluptatem laudantium. Id magnam sit ab quia. Ratione est commodi fugiat ratione.\n \rCumque dolore nostrum. Laudantium sint qui incidunt autem velit cupiditate minima. Optio qui non distinctio ea sed quis."};
const Prd_24 = { _id:"Inventory___Product~~24", code:"p24", barcode:"40063813339324", name:"Refined Frozen Table",  category:"Sports", subcategory:"delectus", description:"Cupiditate aperiam aut nisi laudantium.", longDescription:"Cumque accusantium perferendis ut consequuntur quisquam et doloremque blanditiis. Qui odit consequuntur in. Recusandae rerum aut fugit hic doloremque. Voluptatibus qui sit quoet. Aliquam et vel omnis.\n \rEt assumenda est nihil quo qui dolor est et voluptatem. Corrupti tempora aliquam ut veniam in cupiditate. Doloremque et ipsa dignissimos qui. Fugit non expedita mollitia quibusdam doloribus corrupti aspernatur enim corporis. Dolores veritatis enim aut sed incidunt illum.\n \rEst asperiores cum perspiciatis iusto dolorum necessitatibus autem nobis possimus. Commodi voluptates facilis excepturi doloremque quibusdam at libero est. Atque aspernatur aut. Nesciunt quisquam voluptatem itaque similique dolores suscipit a voluptate et. Doloribus neque veritatis quis magni consectetur."};
const Prd_25 = { _id:"Inventory___Product~~25", code:"p25", barcode:"40063813339325", name:"Tasty Cotton Chips",  category:"Automotive", subcategory:"architecto", description:"Aut hic rerum explicabo ut illo ipsumtempora quisquam pariatur.", longDescription:"A culpa soluta quaerat debitis sed unde dolores nihil. Ipsa labore temporibus quisquam non sed. Minima qui inventore possimus culpa ratione.\n \rQuidem blanditiis magni sint doloribus assumenda. Aut sunt quia libero est vitae facere. Aut sit non blanditiis atque est.\n \rOmnis quia non sed quo explicabo consequatur. Ipsum ea sit qui omnis aut. Impedit ut non illum eos odit ipsam. Earum aut qui tenetur non nesciunt minima similique."};

let Inventory___Product___Location1 = { _id: "Inventory___Product___Location~~1___1", productId: "Inventory___Product~~1", locationCode: "Warehouse1", category: "C1", price: 12.5, received_stock__: 15, ordered_stock__: 10, available_stock__: 5 };
let Inventory___Product___Location1a = { _id: "Inventory___Product___Location~~1___1a", productId: "Inventory___Product~~1a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 5, ordered_stock__: 4, available_stock__: 1 };
let Inventory___Product___Location2a = { _id: "Inventory___Product___Location~~1___2a", productId: "Inventory___Product~~2a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location3a = { _id: "Inventory___Product___Location~~1___3a", productId: "Inventory___Product~~3a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location4a = { _id: "Inventory___Product___Location~~1___4a", productId: "Inventory___Product~~4a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location5a = { _id: "Inventory___Product___Location~~1___5a", productId: "Inventory___Product~~5a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location6a = { _id: "Inventory___Product___Location~~1___6a", productId: "Inventory___Product~~6a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location7a = { _id: "Inventory___Product___Location~~1___7a", productId: "Inventory___Product~~7a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location8a = { _id: "Inventory___Product___Location~~1___8a", productId: "Inventory___Product~~8a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location9a = { _id: "Inventory___Product___Location~~1___9a", productId: "Inventory___Product~~9a", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location10 = { _id: "Inventory___Product___Location~~1___10", productId: "Inventory___Product~~10", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location11 = { _id: "Inventory___Product___Location~~1___11", productId: "Inventory___Product~~11", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location12 = { _id: "Inventory___Product___Location~~1___12", productId: "Inventory___Product~~12", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location13 = { _id: "Inventory___Product___Location~~1___13", productId: "Inventory___Product~~13", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location14 = { _id: "Inventory___Product___Location~~1___14", productId: "Inventory___Product~~14", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location15 = { _id: "Inventory___Product___Location~~1___15", productId: "Inventory___Product~~15", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location16 = { _id: "Inventory___Product___Location~~1___16", productId: "Inventory___Product~~16", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location17 = { _id: "Inventory___Product___Location~~1___17", productId: "Inventory___Product~~17", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location18 = { _id: "Inventory___Product___Location~~1___18", productId: "Inventory___Product~~18", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location19 = { _id: "Inventory___Product___Location~~1___19", productId: "Inventory___Product~~19", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location20 = { _id: "Inventory___Product___Location~~1___20", productId: "Inventory___Product~~20", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location21 = { _id: "Inventory___Product___Location~~1___21", productId: "Inventory___Product~~21", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location22 = { _id: "Inventory___Product___Location~~1___22", productId: "Inventory___Product~~22", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location23 = { _id: "Inventory___Product___Location~~1___23", productId: "Inventory___Product~~23", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location24 = { _id: "Inventory___Product___Location~~1___24", productId: "Inventory___Product~~24", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___Product___Location25 = { _id: "Inventory___Product___Location~~1___25", productId: "Inventory___Product~~25", locationCode: "Warehouse1", category: "C1", price: 10.5, received_stock__: 0, ordered_stock__: 0, available_stock__: 0 };
let Inventory___ProductUnit1 = { _id: "Inventory___ProductUnit~~1" };
let Inventory___Order1 = { _id: "Inventory___Order~~1", sales_agent: "John Doe", creation_date: "2018-09-27" };
let Inventory___Order___Item1_1 = { _id: "Inventory___Order___Item~~1___1", productLocationId: Inventory___Product___Location1._id, quantity: 10 };
let Inventory___Order___Item1_2 = { _id: "Inventory___Order___Item~~1___2", productLocationId: Inventory___Product___Location1a._id, quantity: 4 };
let Inventory___Receipt1 = { _id: "Inventory___Receipt~~1" };
let Inventory___Receipt___Item1_1 = { _id: "Inventory___Receipt___Item~~1___1", productLocationId: Inventory___Product___Location1._id, quantity: 15 };
let Inventory___Receipt___Item1_2 = { _id: "Inventory___Receipt___Item~~1___2", productLocationId: Inventory___Product___Location1a._id, quantity: 5 };
let Forms___ServiceForm1 = { _id: "Forms___ServiceForm~~1" };
let Reports___DetailedCentralizerReport1 = { _id: "Reports___DetailedCentralizerReport~~1" };
let Reports___ServiceCentralizerReport1 = { _id: "Reports___ServiceCentralizerReport~~1" };

export class MockData {

    allData = [
        Act_AdminFredrick,
        Act_OperatorJoannie,
        Act_OperatorKeenan,
        Act_AgentCristal,
        Act_AgentJerrod,
        Act_Johns,
        Act_Simonis,
        Act_Stracke,
        Act_Wolf,
        Act_Buckridge,
        Act_Conn,
        Act_MacGyver,
        Act_Ondricka,
        Act_Collins,
        Act_Wiza,
        Cur_RON,
        Cur_EUR,
        Cur_USD,
        Cln_Ratke,
        Cln_Gibson,
        Cln_Koelpin,
        Cln_Crist,
        Cln_Ledner,
        Cln_Pagac,
        Cln_Toy,
        Cln_Kirlin,
        Cln_Buckridge,
        Cln_Cummerata,
        Prd_1,
        Prd_1a,
        Prd_2a,
        Prd_3a,
        Prd_4a,
        Prd_5a,
        Prd_6a,
        Prd_7a,
        Prd_8a,
        Prd_9a,
        Prd_10,
        Prd_11,
        Prd_12,
        Prd_13,
        Prd_14,
        Prd_15,
        Prd_16,
        Prd_17,
        Prd_18,
        Prd_19,
        Prd_20,
        Prd_21,
        Prd_22,
        Prd_23,
        Prd_24,
        Prd_25,
        Inventory___Product___Location1,
        Inventory___Product___Location1a,
        Inventory___Product___Location2a,
        Inventory___Product___Location3a,
        Inventory___Product___Location4a,
        Inventory___Product___Location5a,
        Inventory___Product___Location6a,
        Inventory___Product___Location7a,
        Inventory___Product___Location8a,
        Inventory___Product___Location9a,
        Inventory___Product___Location10,
        Inventory___Product___Location11,
        Inventory___Product___Location12,
        Inventory___Product___Location13,
        Inventory___Product___Location14,
        Inventory___Product___Location15,
        Inventory___Product___Location16,
        Inventory___Product___Location17,
        Inventory___Product___Location18,
        Inventory___Product___Location19,
        Inventory___Product___Location20,
        Inventory___Product___Location21,
        Inventory___Product___Location22,
        Inventory___Product___Location23,
        Inventory___Product___Location24,
        Inventory___Product___Location25,
        Inventory___ProductUnit1,
        Inventory___Order1,
        Inventory___Order___Item1_1,
        Inventory___Order___Item1_2,
        Inventory___Receipt1,
        Inventory___Receipt___Item1_1,
        Inventory___Receipt___Item1_2,
        Forms___ServiceForm1,
        Reports___DetailedCentralizerReport1,
        Reports___ServiceCentralizerReport1,
    ];

    constructor(private entitiesMap: _.Dictionary<Entity>) {
    }

    public getAllForPath(path: string) {
        let ret: any[] = [];
        for (let obj of this.allData) {
            if (obj._id.indexOf(path) == 0) ret.push(obj);
        }
        return ret;
    }

    public getAll() {
        return this.allData;
    }

}
