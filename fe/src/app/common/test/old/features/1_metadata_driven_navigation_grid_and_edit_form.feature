/**
@uml actor User
@uml participant Browser
@uml participant DB
@uml
@start_plantuml_diagram
                                ,-.                                                             
                                `-'                                                             
                                /|\                                                             
                                 |            ,-------.          ,--.                           
                                / \           |Browser|          |DB|                           
                               User           `---+---'          `+-'                           
                                |                 |               |                             
          _____________________________________________________________________________________ 
          ! NAVIGATION AND GRIDS DYNAMICALLY GENERATED FROM METADATA  /                        !
          !__________________________________________________________/                         !
          !                     |                 |    ______________________________          !
          !                     |                 |    ! PREREQUISITES  /            !         !
          !                     |                 |    !___________----.             !         !
          !                     |                 |    !          |    | metadata    !         !
          !                     |                 |    !          |<---'             !         !
          !                     |                 |    !~~~~~~~~~~~~~~~~~~~~~~~~~~~~~!         !
          !                     |                 |               |                            !
          !                     |                 |               |                            !
          !         ____________________________________________  |                            !
          !         ! NAVIGATION  /               |             ! |                            !
          !         !____________/   homepage     |             ! |                            !
          !         !           | --------------->|             ! |                            !
          !         !~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~! |                            !
          !~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~!
                               User           ,---+---.          ,+-.                           
                                ,-.           |Browser|          |DB|                           
                                `-'           `-------'          `--'                           
                                /|\                                                             
                                 |                                                              
                                / \                                                             

@end_plantuml_diagram
*/

describe("navigation and grids dynamically generated from metadata", function() {
  describe("prerequisites", function () {
    it("DB -> DB: metadata for Products, Currency, ServiceForm*", function() {expect(true).toBe(false);});
  });
  describe("navigation", function () {
    it("User -> Browser: homepage", function () {expect(true).toBe(false);});
    it("User <- Browser: side navigation shows Inventory and Dacris modules", function () {expect(true).toBe(false);});
    it("User -> Browser: click Inventory/Product", function () {expect(true).toBe(false);});
  });
});
