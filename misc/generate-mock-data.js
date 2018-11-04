var faker = require('faker');

let jsonArr = [];
let objs = {};

const UserRoles = ['ADMIN', 'USER'];

function generateActors() {
    let ret = [];
    for (let i = 1; i <= 10; i++) {
        var firstName = faker.name.firstName(),
            lastName = faker.name.lastName();

        ret.push({
            _id: "General___Actor~~" + i,
            firstName: firstName,
            lastName: lastName,
            username: faker.internet.userName(firstName, lastName),
            email: faker.internet.email(firstName, lastName),
            avatar: faker.internet.avatar(), 
            name: faker.name.findName(firstName, lastName), 
            role: UserRoles[i] || 'USER', 
            password: faker.internet.password(),
            details: faker.name.title(),
            state: "ACTIVE_" 
        });
    }
    return ret;
}

function generateCompany() {
    let ret = [];
    for (let i = 1; i <= 10; i++) {
        ret.push({
            _id: "General___Client~~" + i,
            name: faker.company.companyName(),
            email: faker.internet.email(),
            bs: faker.company.bs(), 
            catchPhrase: faker.company.catchPhrase(), 
        });
    }
    return ret;
}

function generateProducts() {
    let ret = [];
    for (let i = 1; i <= 25; i++) {
        ret.push({ _id: "Inventory___Product~~"+i, code: "p" + i, barcode: "400638133393" + i, 
            name: faker.commerce.product(), 
            category: faker.commerce.department(), 
            subcategory: faker.lorem.word(), 
            description: faker.lorem.sentence(),
            longDescription: faker.lorem.paragraphs()
        });
    }
    return ret;
}

console.info(generateProducts().map(x => JSON.stringify(x)).join(",\n"));
