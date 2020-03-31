<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="//*[contains(@class, 'frmdb-t-card-icon-main')]">
    <frmdb-t-card-icon-main>
        <xsl:copy-of select="node()/*"/>
    </frmdb-t-card-icon-main>
</xsl:template>

<xsl:template match="@*|node()">
    <xsl:copy>
        <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
</xsl:template>

</xsl:stylesheet>