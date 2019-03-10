import { Entity, Pn, EntityProperty } from "@core/domain/metadata/entity";

export const Home: Entity = {
    _id: "Home",
    isPresentationPage: true,
    props: {
        title: { name: "title", propType_: Pn.STRING } as EntityProperty,
        tagline: { name: "tagline", propType_: Pn.STRING } as EntityProperty,
        product_features: {
            name: 'product_features',
            propType_: Pn.CHILD_TABLE, referencedEntityName: "ProductFeature", props: {}
        } as EntityProperty,
    }
}

export const ProductFeature: Entity = {
    _id: "ProductFeature",
    isPresentationPage: true,
    props: {
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        description: { name: "description", propType_: Pn.STRING } as EntityProperty,
    }
}

export const Dashboard: Entity = {
    _id: "Dashboard",
    isPresentationPage: true,
    props: {
        website_statistics: {
            name: 'website_statistics',
            propType_: Pn.CHILD_TABLE, referencedEntityName: "WebsiteStatistic", props: {}
        } as EntityProperty,
    }
}

export const WebsiteStatistic: Entity = {
    _id: "WebsiteStatistic",
    isPresentationPage: true,
    props: {
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        value: { name: "value", propType_: Pn.NUMBER } as EntityProperty,
    }
}

export const Ecommerce: Entity = {
    _id: "Ecommerce",
    isPresentationPage: true,
    props: {
    }
}

export const Blog: Entity = {
    _id: "Blog",
    isPresentationPage: true,
    props: {
    }
}

export const Pages: Entity = {
    _id: "Pages",
    isPresentationPage: true,
    pureNavGroupingChildren: [Ecommerce._id, Blog._id],
    props: {}
}
