Feature: Inventory Example App 1
    The Inventory Example App 1 allows users to bla bla
    Lorem ipsum bla bla bla

    Scenario Outline: Change different visualizations (widgets) for the list of products of an Order
        Given "Orders~~row-id~~Items~~WidgetId" is visualized as a <BeforeWidget>
        When I click "Orders~~row-id~~Items~~WidgetId~~ContextMenu"
        And change the widget to <AfterWidget>
        Then "Orders~~row-id~~Items~~WidgetId" is visualized as a <AfterWidget>

        Examples:
            | BeforeWidget | AfterWidget |
            | Table        | Mosaic      |
            | Table        | List        |
            | List         | Table       |
            | List         | Mosaic      |
            | Mosaic       | Table       |
            | Mosaic       | List        |
