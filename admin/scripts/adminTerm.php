<?php

require('..\\resources\\scripts\\db\\dbConnect.php');

class adminTerminal
{
    private $pageTitle;

    function __construct($slug = null)
    {
        if($slug === null)
        {
            $this->pageTitle = "CREATE";
        }
        else
        {
            $this->pageTitle = "EDIT";
        }
    }

    function pageTitle()
    {
        return $this->pageTitle;
    }
}