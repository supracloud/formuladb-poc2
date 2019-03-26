import { Act_Wolf, Act_Johns, Act_Simonis, Act_Stracke, Act_Buckridge, Act_MacGyver, Act_Ondricka, Act_Collins, Act_Wiza } from "./general-data";

export const BkItem1 = { _id: "BookingItem~~1", price: 100, name: "Practical Room", picture: "/assets/img/rooms/living-room-581073_1920.jpg", description: "Quas reiciendis non et eveniet iure aut.", long_description: "Doloribus recusandae fuga ea magnam. Magnam unde culpa sed voluptates alias veniam quis ea provident. Qui ad rerum laborum quas eum quisquam.\n \rIpsam voluptates quaerat molestias. Aperiam eos explicabo voluptate id est molestias iusto. Aliquam dolores sit quo quia. Nobis doloremque aut neque. Enim et sit nobis minima est ipsa ut mollitia. Odio aut nemo dolorum repellat occaecati possimus quia saepe consequuntur.\n \rVoluptas nisi qui dolore commodi quis fugiat fuga. Ipsam qui quasi ad. Sapiente repellendus quidem qui dolorum. Asperiores vel velit repellat aut voluptate excepturi. Doloribus quia accusamus qui hic blanditiis. Totam et reprehenderit autem sequi eveniet quas sapiente et dolores." };
export const BkItem2 = { _id: "BookingItem~~2", price: 200, name: "Gorgeous Room", picture: "/assets/img/rooms/kitchen-2165756_1920.jpg", description: "Libero voluptatem aut.", long_description: "Velit saepe nam aspernatur ut expedita. Delectus accusantium ut non voluptate dolorem asperiores fuga ipsa. Ut animi tempora sed nihil et. Id voluptatum aut soluta suscipit. Qui ut illo et. Soluta adipisci sint.\n \rEst rerum vel est facilis dolorum ut. Provident corrupti doloremque et. Nihil culpa et rem libero. Beatae iste quidem et nulla asperiores atque voluptatem.\n \rUt temporibus incidunt. Unde dignissimos impedit eligendi veritatis hic et dolores. Tempore animi velit repudiandae beatae vero." };
export const BkItem3 = { _id: "BookingItem~~3", price: 300, name: "Fantastic Room", picture: "/assets/img/rooms/bedroom-1872196_1920.jpg", description: "Aut culpa iusto harum ad.", long_description: "Earum dolore hic fugit ad delectus reprehenderit consequatur inventore. Dolore autem dolor cum et ipsa facilis. Eius eligendi incidunt et sapiente et laborum tempora. Et blanditiis quo praesentium mollitia inventore qui.\n \rEos iure voluptate distinctio sed dolor. Id asperiores ut unde illum modi velit non. Sit dolorem velit. Sed soluta velit. Accusantium et aliquam.\n \rAutem praesentium aspernatur reprehenderit praesentium sed. Perspiciatis architecto quia non neque. Sint repellat omnis enim officia est rerum. Similique quia fugiat odio cumque accusantium dolor. Molestiae animi impedit voluptate maiores ipsam rem excepturi sed. Pariatur dolorem voluptatem non est enim assumenda impedit." };
export const BkItem4 = { _id: "BookingItem~~4", price: 400, name: "Awesome Room", picture: "/assets/img/rooms/interior-2685521_1920.jpg", description: "Assumenda nostrum quaerat fugit nesciunt libero aliquam.", long_description: "Quia minus veritatis quidem autem et sed qui qui. Aut qui repellendus aut et ipsum porro. Illo vel optio quisquam voluptatibus vel enim qui sint et. Doloribus quis ea reprehenderit aliquam deleniti rem nesciunt temporibus sequi.\n \rMinima cum minima sed consequatur deleniti voluptate dolor vero. Cupiditate quibusdam voluptatibus eum et distinctio laudantium numquam. Facere maxime ut accusantium est id culpa. Reprehenderit maiores at. Et laboriosam explicabo ab sed tempore exercitationem enim perspiciatis. Corrupti omnis cum qui nostrum.\n \rDignissimos corporis molestiae velit qui. Ea dolores ea fugit facilis atque blanditiis praesentium aut. Iure rem aliquam." };

export const BookingData = [
    BkItem1,
    BkItem2,
    BkItem3,
    BkItem4,
    { _id: "Booking~~1__1", booking_item_id: BkItem1._id, start_date: '2019-03-03', end_date: '2019-03-08', booking_item_name: BkItem1.name, booking_item_price: BkItem1.price, user_id: Act_Wolf._id, user_name: Act_Wolf.name},
    { _id: "Booking~~1__2", booking_item_id: BkItem1._id, start_date: '2019-03-19', end_date: '2019-03-24', booking_item_name: BkItem1.name, booking_item_price: BkItem1.price, user_id: Act_Johns._id, user_name: Act_Johns.name},
    { _id: "Booking~~2__3", booking_item_id: BkItem2._id, start_date: '2019-03-03', end_date: '2019-03-08', booking_item_name: BkItem2.name, booking_item_price: BkItem2.price, user_id: Act_Simonis._id, user_name: Act_Simonis.name},
    { _id: "Booking~~2__4", booking_item_id: BkItem2._id, start_date: '2019-03-19', end_date: '2019-03-24', booking_item_name: BkItem2.name, booking_item_price: BkItem2.price, user_id: Act_Stracke._id, user_name: Act_Stracke.name},
    { _id: "Booking~~3__5", booking_item_id: BkItem3._id, start_date: '2019-03-03', end_date: '2019-03-08', booking_item_name: BkItem3.name, booking_item_price: BkItem3.price, user_id: Act_Buckridge._id, user_name: Act_Buckridge.name},
    { _id: "Booking~~3__6", booking_item_id: BkItem3._id, start_date: '2019-03-19', end_date: '2019-03-24', booking_item_name: BkItem3.name, booking_item_price: BkItem3.price, user_id: Act_MacGyver._id, user_name: Act_MacGyver.name},
    { _id: "Booking~~4__7", booking_item_id: BkItem4._id, start_date: '2019-03-03', end_date: '2019-03-08', booking_item_name: BkItem4.name, booking_item_price: BkItem4.price, user_id: Act_Ondricka._id, user_name: Act_Ondricka.name},
    { _id: "Booking~~4__8", booking_item_id: BkItem4._id, start_date: '2019-03-19', end_date: '2019-03-24', booking_item_name: BkItem4.name, booking_item_price: BkItem4.price, user_id: Act_Collins._id, user_name: Act_Collins.name},
];
