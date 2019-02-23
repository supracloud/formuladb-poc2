Feature: Inventory Example App 1
    The Inventory Example App 1 allows users to bla bla 
    Lorem ipsum bla bla bla

Scenario: Use the app
    When Navigate to inventory page
    And Navigate to inventory
    And Navigate to product locations
    Then Notice the data in product locations
    When Group table by category
    And Open first group
    Then See the right number of rows
    When Select first inventory order
    Then See the data in order page
    When Edit item quantity and be auto-corrected
    And Navigate back to product locations
    Then Notice the stock is zero
