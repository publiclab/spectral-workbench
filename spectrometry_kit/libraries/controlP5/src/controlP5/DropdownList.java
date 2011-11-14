package controlP5;

public class DropdownList extends ListBox {

	protected DropdownList(
			ControlP5 theControlP5,
			ControllerGroup theGroup,
			String theName,
			int theX,
			int theY,
			int theW,
			int theH) {
		super(theControlP5, theGroup, theName, theX, theY, theW, theH);
		actAsPulldownMenu(true);
	}
	
	@Override
	public String stringValue() {
		return captionLabel().toString();
	}
	
}
